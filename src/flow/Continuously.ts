import { throwIntegerTest } from '../Guards.js';
import { intervalToMs, type Interval } from './IntervalType.js';
import type { HasCompletion, HasCompletionRunStates } from './Types.js';
/**
 * Runs a function continuously, returned by {@link Continuously}
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
   * How many milliseconds since start() was last called
   */
  get elapsedMs(): number;
  /**
   * How many iterations of the loop since start() was last called
   */
  //get ticks(): number;
  /**
   * Returns _true_ if the loop is not running. This could be because
   * it was never started, or it started and was exited.
   */
  //get isDone(): boolean;
  /**
   * Returns _true_ if the loop is currently running.
   */
  //get isRunning(): boolean;
  /**
   * If disposed, the continuously instance won't be re-startable
   */
  get isDisposed(): boolean;
  /**
   * Stops loop. It can be restarted using .start()
   */
  cancel(): void;
  /**
   * Set interval. Change will take effect on next loop. For it to kick
   * in earlier, call .reset() after changing the value.
   */
  set interval(interval: Interval);
  get interval(): Interval;
};

export type ContinuouslySyncCallback = (
  ticks?: number,
  elapsedMs?: number
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
) => boolean | void;
export type ContinuouslyAsyncCallback = (
  ticks?: number,
  elapsedMs?: number
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
) => Promise<boolean | void>;

export type OnStartCalled = `continue` | `cancel` | `reset` | `dispose`;

//eslint-disable-next-line functional/no-mixed-types
export type ContinuouslyOpts = {
  readonly fireBeforeWait: boolean;
  /**
   * Called whenever .start() is invoked.
   * If this function returns:
   *  - `continue`: the loop starts if it hasn't started yet, or continues if already started
   *  - `cancel`: loop stops, but can be re-started if .start() is called again
   *  - `dispose`: loop stops and will throw an error if .start() is attempted to be called
   *  - `reset`: loop resets (ie. existing scheduled task is cancelled)
   *
   */
  readonly onStartCalled: (
    ticks?: number,
    elapsedMs?: number
  ) => OnStartCalled;
};

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
 * c.intervalMs; // Get/set speed of loop. Change kicks-in at next loop.
 *               // Use .start() to reset to new interval immediately
 * ```
 *
 * Asynchronous callback functions are supported too:
 * ```js
 * continuously(async () => { ..});
 * ```
 *
 * The `callback` function can receive a few arguments:
 * ```js
 * continuously( (ticks, elapsedMs) => {
 *  // ticks: how many times loop has run
 *  // elapsedMs:  how long since last loop
 * }).start();
 * ```
 *
 * If the callback explicitly returns _false_, the loop will be cancelled
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
 * ```js
 * continuously(callback, intervalMs, {
 *  onStartCalled:(ticks, elapsedMs) => {
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
 * @param opts Additional options
 * @param intervalMs
 * @returns
 */
export const continuously = (
  callback: ContinuouslyAsyncCallback | ContinuouslySyncCallback,
  interval?: Interval,
  opts: Partial<ContinuouslyOpts> = {}
): Continuously => {
  let intervalMs = intervalToMs(interval, 0);
  throwIntegerTest(intervalMs, `positive`, `interval`);

  const fireBeforeWait = opts.fireBeforeWait ?? false;
  const onStartCalled = opts.onStartCalled;

  let disposed = false;
  //let running = false;
  let runState: HasCompletionRunStates = `idle`;
  let startCount = 0;
  let ticks = 0;
  let startedAt = performance.now();
  let intervalUsed = interval ?? 0;
  let cancelled = false;
  let currentTimer: ReturnType<typeof globalThis.setTimeout> | undefined;

  const deschedule = () => {
    if (currentTimer === undefined) return;
    //console.log(`continuously.deschedule`);
    globalThis.clearTimeout(currentTimer);
    currentTimer = undefined;
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
  // const schedule =
  //   intervalMs === 0
  //     ? raf
  //     : (callback_: () => void) => globalThis.setTimeout(callback_, intervalMs);
  // const deschedule =
  //   intervalMs === 0
  //     ? (_: number) => {
  //       /** no-op */
  //     }
  //     // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
  //     : (timer: number) => globalThis.clearTimeout(timer);

  const cancel = () => {
    //console.log(`continuously.cancel state: ${ runState }. cancelled: ${ cancelled }`);
    if (cancelled) return;
    cancelled = true;

    if (runState === `idle`) return; // No need to cancel
    runState = `idle`;
    ticks = 0;
    deschedule();
  };

  const loop = async () => {
    //console.log(`continuously loop state: ${ runState } timer: ${ currentTimer }`);
    if (runState === `idle`) return;
    runState = `running`
    startCount++;
    const valueOrPromise = callback(ticks++, performance.now() - startedAt);
    const value = typeof valueOrPromise === `object` ? (await valueOrPromise) : valueOrPromise;
    if (cancelled) {
      //console.log(`continiously cancelled!`);
      return;
    }
    runState = `scheduled`;

    // Didn't get a value, exit out
    if (value !== undefined && !value) {
      cancel();
      return;
    }
    if (cancelled) return; // has been cancelled
    //console.log(`continuously.loop rescheduling`);
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    schedule(loop);
  };

  const start = () => {
    if (disposed) throw new Error(`Disposed`);
    cancelled = false;
    if (onStartCalled !== undefined) {
      // A function governs whether to allow .start() to go ahead
      const doWhat = onStartCalled(ticks, performance.now() - startedAt);
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

    //console.log(`continuously start runState: ${ runState }`);
    if (runState === `idle`) {
      // Start running
      startedAt = performance.now();
      runState = `scheduled`;
      if (fireBeforeWait) {
        void loop(); // Exec first, then wait
      } else {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        schedule(loop); // Wait first, then exec
      }
    }
  };

  const reset = () => {
    if (disposed) throw new Error(`Disposed`);
    cancelled = false;

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
