import { throwIntegerTest } from '../util/GuardNumbers.js';
import { intervalToMs, type Interval } from './IntervalType.js';
import type { HasCompletion, HasCompletionRunStates } from './Types.js';
/**
 * Runs a function continuously, returned by {@link continuously}
 */
export type Continuously = HasCompletion & {
  /**
   * Starts loop. If already running, does nothing
   */
  start(): void;

  /**
   * (Re-)starts the loop. If an existing iteration has been
   * scheduled, this is cancelled and started again.
   *
   * This can be useful when adjusting the interval
   */
  reset(): void;
  /**
   * How many milliseconds since loop was started after being stopped.
   */
  get elapsedMs(): number;
  /**
   * If disposed, the continuously instance won't be re-startable
   */
  get isDisposed(): boolean;
  /**
   * Stops loop. It can be restarted using .start()
   */
  cancel(): void;
  /**
   * Sets the interval speed of loop. Change will take effect on next loop. For it to kick
   * in earlier, call .reset() after changing the value.
   */
  set interval(interval: Interval);
  /**
   * Gets the current interval, ie. speed of loop.
   */
  get interval(): Interval;
};

export type ContinuouslySyncCallback = (
  /**
   * Number of times loop
   * Ticks is reset when loop exits.
   */
  ticks?: number,
  /**
   * Elapsed milliseconds.
   * Reset when loop exits
   */
  elapsedMs?: number
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
) => boolean | void;

export type ContinuouslyAsyncCallback = (
  /**
   * Number of times loop has run
   * Reset when loop exits.
   */
  ticks?: number,
  /**
   * Elapsed milliseconds.
   * Reset when loop exits.
   */
  elapsedMs?: number
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
) => Promise<boolean | void>;

export type OnStartCalled = `continue` | `cancel` | `reset` | `dispose`;

//eslint-disable-next-line functional/no-mixed-types
export type ContinuouslyOpts = Readonly<{
  /**
   * Abort signal to exit loop
   */
  signal: AbortSignal;
  /**
   * If _true_, callback runs before waiting period.
   * Default: _false_
   */
  fireBeforeWait: boolean;
  /**
   * Called whenever .start() is invoked.
   * If this function returns:
   *  - `continue`: the loop starts if it hasn't started yet, or continues if already started
   *  - `cancel`: loop stops, but can be re-started if .start() is called again
   *  - `dispose`: loop stops and will throw an error if .start() is attempted to be called
   *  - `reset`: loop resets (ie. existing scheduled task is cancelled)
   *
   */
  onStartCalled: (
    /**
     * Number of times loop has run
     * Reset when loop is exits.
     */
    ticks?: number,
    /**
     * Elapsed milliseconds.
     * Reset when loop is exits.
     */
    elapsedMs?: number
  ) => OnStartCalled;
}>;

/**
 * Returns a {@link Continuously} that continuously at `intervalMs`, executing `callback`.
 * By default, first the sleep period happens and then the callback happens.
 * Use {@link Timeout} for a single event.
 *
 * If callback returns _false_, loop exits.
 *
 * Call `start` to begin/reset loop. `cancel` stops loop.
 *
 * @example Animation loop
 * ```js
 * const draw = () => {
 *  // Draw on canvas
 * }
 *
 * // Run draw() synchronised with monitor refresh rate via `window.requestAnimationFrame`
 * continuously(draw).start();
 * ```
 *
 * @example With delay
 * ```js
 * const fn = () => {
 *  console.log(`1 minute`);
 * }
 * const c = continuously(fn, 60*1000);
 * c.start(); // Runs `fn` every minute
 * ```
 *
 * @example Control a 'continuously'
 * ```js
 * c.cancel();   // Stop the loop, cancelling any up-coming calls to `fn`
 * c.elapsedMs;  // How many milliseconds have elapsed since start
 * c.ticks;      // How many iterations of loop since start
 * c.interval; // Get/set speed of loop. Change kicks-in at next loop.
 *               // Use .start() to reset to new interval immediately
 * ```
 *
 * Asynchronous callback functions are supported too:
 * ```js
 * continuously(async () => { ..});
 * ```
 *
 * The `callback` function can receive a few arguments:
 * 
 * ```js
 * continuously( (ticks, elapsedMs) => {
 *  // ticks: how many times loop has run
 *  // elapsedMs:  how long since last loop
 * }).start();
 * ```
 *
 * If the callback explicitly returns _false_, the loop will be cancelled.
 * 
 * ```js
 * continuously(ticks => {
 *  // Stop after 100 iterations
 *  if (ticks > 100) return false;
 * }).start();
 * ```
 *
 * You can intercept the logic for calls to `start()` with `onStartCalled`. It can determine
 * whether the `start()` proceeds, if the loop is cancelled, or the whole thing disposed,
 * so it can't run any longer.
 * 
 * ```js
 * continuously(callback, intervalMs, {
 *  onStartCalled:(ticks, elapsedMs) => {
 *    // Cancel the loop after 1000ms has elapsed
 *    if (elapsedMs > 1000) return `cancel`;
 *  }
 * }).start();
 * ```
 *
 * To run `callback` *before* the sleep happens, set `fireBeforeWait`:
 * ```js
 * continuously(callback, intervalMs, { fireBeforeWait: true });
 * ```
 * @param callback Function to run. If it returns false, loop exits.
 * @param options Additional options
 * @param interval Speed of loop (default: 0)
 * @returns
 */
export const continuously = (
  callback: ContinuouslyAsyncCallback | ContinuouslySyncCallback,
  interval?: Interval,
  options: Partial<ContinuouslyOpts> = {}
): Continuously => {
  let intervalMs = intervalToMs(interval, 0);
  throwIntegerTest(intervalMs, `positive`, `interval`);
  const fireBeforeWait = options.fireBeforeWait ?? false;
  const onStartCalled = options.onStartCalled;
  const signal = options.signal;

  let disposed = false;
  let runState: HasCompletionRunStates = `idle`;
  let startCount = 0;
  let startCountTotal = 0;
  let startedAt = performance.now();
  let intervalUsed = interval ?? 0;
  let cancelled = false;
  let currentTimer: ReturnType<typeof globalThis.setTimeout> | undefined;

  const deschedule = () => {
    if (currentTimer === undefined) return;
    globalThis.clearTimeout(currentTimer);
    currentTimer = undefined;
    startCount = 0;
    startedAt = Number.NaN;
  }

  const schedule = (scheduledCallback: () => void) => {
    if (intervalMs === 0) {
      if (typeof requestAnimationFrame === `undefined`) {
        currentTimer = globalThis.setTimeout(scheduledCallback, 0);
      } else {
        currentTimer = undefined;
        requestAnimationFrame(scheduledCallback);
      }
    } else {
      currentTimer = globalThis.setTimeout(scheduledCallback, intervalMs);
    }
  }

  const cancel = () => {
    if (cancelled) return;
    cancelled = true;

    if (runState === `idle`) return; // No need to cancel
    runState = `idle`;
    deschedule();
  };

  const loop = async () => {
    if (signal?.aborted) {
      runState = `idle`;
    }
    if (runState === `idle`) return;

    runState = `running`
    startCount++;
    startCountTotal++;
    const valueOrPromise = callback(startCount, performance.now() - startedAt);
    const value = typeof valueOrPromise === `object` ? (await valueOrPromise) : valueOrPromise;
    if (cancelled) {
      return;
    }
    runState = `scheduled`;

    // Didn't get a value, exit out
    if (value !== undefined && !value) {
      cancel();
      return;
    }
    if (cancelled) return; // has been cancelled
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    schedule(loop);
  };

  const start = () => {
    if (disposed) throw new Error(`Disposed`);
    cancelled = false;

    if (onStartCalled !== undefined) {
      // A function governs whether to allow .start() to go ahead
      const doWhat = onStartCalled(startCount, performance.now() - startedAt);
      switch (doWhat) {
        case `cancel`: {
          cancel();
          return;
        }
        case `reset`: {
          reset();
          return;
        }
        case `dispose`: {
          disposed = true;
          cancel();
          return;
        }
        // No default
      }
    }

    if (runState === `idle`) {
      // Start running
      startCount = 0;
      startedAt = performance.now();
      runState = `scheduled`;
      if (fireBeforeWait) {
        void loop(); // Exec first, then wait
      } else {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        schedule(loop); // Wait first, then exec
      }
    } // else: already running, ignore
  };

  const reset = () => {
    if (disposed) throw new Error(`Disposed`);
    cancelled = false;
    startCount = 0;
    startedAt = Number.NaN;

    // Cancel scheduled iteration
    if (runState !== `idle`) {
      cancel();
    }
    start();
  };

  return {
    start,
    reset,
    cancel,
    get interval() {
      return intervalUsed;
    },
    get runState() {
      return runState;
    },
    get startCountTotal() {
      return startCountTotal;
    },
    get startCount() {
      return startCount;
    },
    set interval(interval: Interval) {
      const ms = intervalToMs(interval, 0);
      throwIntegerTest(ms, `positive`, `interval`);
      intervalMs = ms;
      intervalUsed = interval;
    },
    get isDisposed() {
      return disposed;
    },
    get elapsedMs() {
      return performance.now() - startedAt;
    },
  };
};
