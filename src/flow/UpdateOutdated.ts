
export type UpdateFailPolicy = `fast` | `slow` | `backoff`; 
/**
 * Calls the async `fn` to generate a value if there is no prior value or
 * `intervalMs` has elapsed since value was last generated.
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
 * Callback `fn` is passed how many milliseconds have elapsed since last update. It's
 * minimum value will be `intervalMs`.
 * 
 * ```js
 * const f = updateOutdated(async elapsedMs => {
 *  // Do something with elapsedMs?
 * }, 60*1000;
 * ```
 * 
 * There are different policies for what to happen if `fn` fails. `slow` is the default.
 * * `fast`: Invocation will happen immediately on next attempt
 * * `slow`: Next invocation will wait `intervalMs` as if it was successful
 * * `backoff`: Attempts will get slower and slower until next success. Interval is multipled by 1.2 each time.
 * 
 * @param fn Async function to call. Must return a value.
 * @param intervalMs Maximum age of cached result
 * @param updateFail `slow` by default
 * @returns Value
 */
export const updateOutdated = <V>(fn:(elapsedMs?:number)=>Promise<V>, intervalMs:number, updateFail:UpdateFailPolicy = `slow`):()=>Promise<V> => {
  //eslint-disable-next-line functional/no-let
  let lastRun = 0;
  //eslint-disable-next-line functional/no-let
  let lastValue:V|undefined;
  //eslint-disable-next-line functional/no-let
  let intervalMsCurrent = intervalMs;

  //eslint-disable-next-line no-async-promise-executor
  return () => (new Promise(async (resolve, reject) => {
    const elapsed = performance.now() - lastRun;
    if (lastValue === undefined || elapsed > intervalMsCurrent) {
      try {
        lastRun = performance.now();
        lastValue = await fn(elapsed);
        intervalMsCurrent = intervalMs;
      } catch (ex) {
        if (updateFail === `fast`) {
          lastValue = undefined;
          lastRun = 0;
        } else if (updateFail === `backoff`) {
          intervalMsCurrent = Math.floor(intervalMsCurrent*1.2);
        }
        reject(ex);
        return;
      }
    } 
    resolve(lastValue);
  }));
};