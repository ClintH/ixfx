import { throwIntegerTest, integerTest } from '../Guards.js';
import { type HasCompletion } from './index.js';
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
  start(altTimeoutMs?: number, args?: ReadonlyArray<unknown>): void;
  cancel(): void;
  get hasExecuted(): boolean;
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
 * t.isDone;    // True if a scheduled event is pending
 * ```
 *
 * Callback function receives any additional parameters passed in from start.
 * This can be useful for passing through event data:
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
  let completedCount = 0;
  let running = false;

  const start = async (
    altInterval: Interval = interval,
    args: Array<unknown>
  ): Promise<void> => {
    const p = new Promise<void>((resolve, reject) => {
      startedAt = performance.now();
      const altTimeoutMs = intervalToMs(altInterval);
      const it = integerTest(altTimeoutMs, `aboveZero`, `altTimeoutMs`);
      if (!it[ 0 ]) {
        reject(it[ 1 ]);
        return;
      }
      if (running) cancel();

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      timer = globalThis.setTimeout(async () => {
        const args_ = args ?? [];
        await callback(performance.now() - startedAt, ...args_);
        completedCount++;
        running = false;
        resolve();
      }, altTimeoutMs);
    });
    return p;
  };

  const cancel = () => {
    if (!running) return;
    startedAt = 0;
    globalThis.clearTimeout(timer);
    running = false;
  };

  return {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    start,
    cancel,
    /**
     * Returns _true_ timer has executed `callback`.
     * Returns _false_ if timer hasn't been started, elapsed time hasn't been reached
     * or the timer was cancelled.
     */
    get hasExecuted() {
      return completedCount > 0;
    },
    get isDone() {
      return startedAt === 0;
    }
  };
};
