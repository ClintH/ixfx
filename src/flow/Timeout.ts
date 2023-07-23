import { integer as guardInteger } from '../Guards.js';
import { type HasCompletion } from './index.js';

export type TimeoutSyncCallback = (
  elapsedMs?: number,
  ...args: readonly unknown[]
) => void;
export type TimeoutAsyncCallback = (
  elapsedMs?: number,
  ...args: readonly unknown[]
) => Promise<void>;

/**
 * A resettable timeout, returned by {@link timeout}
 */
export type Timeout = HasCompletion & {
  start(altTimeoutMs?: number, args?: readonly unknown[]): void;
  cancel(): void;
  get isDone(): boolean;
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
  timeoutMs: number
): Timeout => {
  if (callback === undefined) {
    throw new Error(`callback parameter is undefined`);
  }
  guardInteger(timeoutMs, `aboveZero`, `timeoutMs`);

  //eslint-disable-next-line functional/no-let
  let timer = 0;
  //eslint-disable-next-line functional/no-let
  let startedAt = 0;
  const start = async (
    altTimeoutMs: number = timeoutMs,
    //eslint-disable-next-line functional/prefer-immutable-types
    args: unknown[]
  ): Promise<void> => {
    const p = new Promise<void>((resolve, reject) => {
      startedAt = performance.now();
      try {
        guardInteger(altTimeoutMs, `aboveZero`, `altTimeoutMs`);
      } catch (e) {
        reject(e);
        return;
      }
      if (timer !== 0) cancel();
      timer = window.setTimeout(async () => {
        await callback(performance.now() - startedAt, ...args);
        timer = 0;
        resolve(undefined);
      }, altTimeoutMs);
    });
    return p;
  };

  const cancel = () => {
    if (timer === 0) return;
    startedAt = 0;
    window.clearTimeout(timer);
  };

  return {
    start,
    cancel,
    get isDone() {
      return timer !== 0;
    },
  };
};
