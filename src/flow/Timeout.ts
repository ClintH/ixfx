import { throwIntegerTest, integerTest } from '../Guards.js';
import { type HasCompletion, type HasCompletionRunStates } from './index.js';

import { intervalToMs, type Interval } from './IntervalType.js';

export type TimeoutSyncCallback = (
  elapsedMs?: number,
  ...args: ReadonlyArray<unknown>
) => void;
export type TimeoutAsyncCallback = (
  elapsedMs?: number,
  ...args: ReadonlyArray<unknown>
) => Promise<void>;

/**
 * A resettable timeout, returned by {@link timeout}
 */
export type Timeout = HasCompletion & {
  /**
   * Starts the timer.
   * If the timer has already been started and has a scheduled execution, this is cancelled 
   * and re-scheduled.
   * @param altTimeoutMs Optional override for the interval. Use _undefined_ to use the original interval
   * @param args 
   */
  start(altTimeoutMs?: number, args?: ReadonlyArray<unknown>): void;
  /**
   * Cancels the timer, aborting any scheduled execution.
   */
  cancel(): void;
};

/**
 * Returns a {@link Timeout} that can be triggered, cancelled and reset. Use {@link continuously} for interval-
 * based loops.
 *
 * Once `start()` is called, `callback` will be scheduled to execute after `timeoutMs`.
 * If `start()` is called again, the waiting period will be reset to `timeoutMs`.
 *
 * @example Essential functionality
 * ```js
 * const fn = () => {
 *  console.log(`Executed`);
 * };
 * const t = timeout(fn, 60*1000);
 * t.start();   // After 1 minute `fn` will run, printing to the console
 * ```
 *
 * @example Control execution functionality
 * ```
 * t.cancel();  // Cancel it from running
 * t.start();   // Schedule again after 1 minute
 * t.start(30*1000); // Cancel that, and now scheduled after 30s
 * 
 * // Get the current state of timeout
 * t.runState;    // "idle", "scheduled" or "running"
 * ```
 *
 * Callback function receives any additional parameters passed in from start. This can be useful for passing through event data:
 *
 * @example
 * ```js
 * const t = timeout( (elapsedMs, ...args) => {
 *  // args contains event data
 * }, 1000);
 * el.addEventListener(`click`, t.start);
 * ```
 *
 * Asynchronous callbacks can be used as well:
 * ```js
 * timeout(async () => {...}, 100);
 * ```
 *
 * If you don't expect to need to control the timeout, consider using {@link delay},
 * which can run a given function after a specified delay.
 * @param callback
 * @param timeoutMs
 * @returns {@link Timeout}
 */
export const timeout = (
  callback: TimeoutSyncCallback | TimeoutAsyncCallback,
  interval: Interval
): Timeout => {
  if (callback === undefined) {
    throw new Error(`callback parameter is undefined`);
  }
  const intervalMs = intervalToMs(interval);
  throwIntegerTest(intervalMs, `aboveZero`, `interval`);

  let timer: ReturnType<typeof setTimeout>;
  let startedAt = 0;
  let startCount = 0;
  let state: HasCompletionRunStates = `idle`;

  const clear = () => {
    startedAt = 0;
    globalThis.clearTimeout(timer);
    state = `idle`;
  }

  const start = async (
    altInterval: Interval = interval,
    args: Array<unknown>
  ): Promise<void> => {
    const p = new Promise<void>((resolve, reject) => {
      startedAt = performance.now();
      const altTimeoutMs = intervalToMs(altInterval);
      const it = integerTest(altTimeoutMs, `aboveZero`, `altTimeoutMs`);
      if (!it[ 0 ]) {
        reject(new Error(it[ 1 ]));
        return;
      }

      switch (state) {
        case `scheduled`: {
          // Cancel other scheduled execution
          cancel();
          break;
        }
        case `running`: {
          //console.warn(`Timeout being rescheduled while task is already running`);
          break;
        }
      }
      state = `scheduled`;

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      timer = globalThis.setTimeout(async () => {
        if (state !== `scheduled`) {
          console.warn(`Timeout skipping execution since state is not 'scheduled'`);
          clear();
          return;
        }
        const args_ = args ?? [];
        startCount++;
        state = `running`;
        await callback(performance.now() - startedAt, ...args_);
        state = `idle`
        clear();
        resolve();
      }, altTimeoutMs);
    });
    return p;
  };

  const cancel = () => {
    if (state === `idle`) return;
    clear();
  };

  return {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    start,
    cancel,
    get runState() {
      return state;
    },
    get startCount() {
      return startCount;
    }
  };
};


// const average = movingAverageLight();
// const rm = rateMinimum({
//   interval: { secs: 1 },
//   whatToCall: (distance: number) => {
//     average(distance);
//   },
//   fallback() {
//     return 0;
//   }
// })
// document.addEventListener(`pointermove`, event => {
//   rm(event.movementX + event.movementY);
// });