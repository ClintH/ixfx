import { intervalToMs, type Interval } from "@ixfxfun/core";

export type UpdateFailPolicy = `fast` | `slow` | `backoff`;
/**
 * Calls the async `fn` to generate a value if there is no prior value or
 * `interval` has elapsed since value was last generated.
 * @example
 * ```js
 * const f = updateOutdated(async () => {
 *  const r = await fetch(`blah`);
 *  return await r.json();
 * }, 60*1000);
 *
 * // Result will be JSON from fetch. If fetch happened already in the
 * // last 60s, return cached result. Otherwise it will fetch data
 * const result = await f();
 * ```
 *
 * Callback `fn` is passed how many milliseconds have elapsed since last update. Its minimum value will be `interval`.
 *
 * ```js
 * const f = updateOutdated(async elapsedMs => {
 *  // Do something with elapsedMs?
 * }, 60*1000;
 * ```
 *
 * There are different policies for what to happen if `fn` fails. `slow` is the default.
 * * `fast`: Invocation will happen immediately on next attempt
 * * `slow`: Next invocation will wait `interval` as if it was successful
 * * `backoff`: Attempts will get slower and slower until next success. Interval is multipled by 1.2 each time.
 *
 * @param fn Async function to call. Must return a value.
 * @param interval Maximum age of cached result
 * @param updateFail `slow` by default
 * @typeParam V - Return type of `fn`
 * @returns Value
 */
export const updateOutdated = <V>(
  fn: (elapsedMs?: number) => Promise<V>,
  interval: Interval,
  updateFail: UpdateFailPolicy = `slow`
): (() => Promise<V>) => {
  let lastRun = 0;
  let lastValue: V | undefined;
  let intervalMsCurrent = intervalToMs(interval, 1000);

  return () =>
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    new Promise(async (resolve, reject) => {
      const elapsed = performance.now() - lastRun;
      if (lastValue === undefined || elapsed > intervalMsCurrent) {
        try {
          lastRun = performance.now();
          lastValue = await fn(elapsed);
          intervalMsCurrent = intervalToMs(interval, 1000);
        } catch (error) {
          if (updateFail === `fast`) {
            lastValue = undefined;
            lastRun = 0;
          } else if (updateFail === `backoff`) {
            intervalMsCurrent = Math.floor(intervalMsCurrent * 1.2);
          }
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          reject(error);
          return;
        }
      }
      resolve(lastValue);
    });
};
