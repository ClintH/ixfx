/***
 * Throttles a function. Callback only allowed to run after minimum of `intervalMinMs`.
 * 
 * @example Only handle move event every 500ms
 * ```js
 * const moveThrottled = throttle( (elapsedMs, args) => {
 *  // Handle ar
 * }, 500);
 * el.addEventListener(`pointermove`, moveThrottled)
 * ```
 * 
 * Note that `throttle` does not schedule invocations, but rather acts as a filter that
 * sometimes allows follow-through to `callback`, sometimes not. There is an expectation then
 * that the return function from `throttle` is repeatedly called, such as the case for handling
 * a stream of data/events.
 * 
 * @example Manual trigger
 * ```js
 * // Set up once
 * const t = throttle( (elapsedMs, args) => { ... }, 5000);
 * 
 * // Later, trigger throttle. Sometimes the callback will run,
 * // with data passed in to args[0]
 * t(data);
 * ```
 */
export const throttle = (callback:(elapsedMs:number, ...args:readonly unknown[]) => void|Promise<unknown>, intervalMinMs:number) => {
  //eslint-disable-next-line functional/no-let
  let trigger = 0;

  return async (...args:unknown[]) => {
    const elapsed = performance.now()-trigger; 
    if (elapsed >= intervalMinMs) {
      const r = callback(elapsed, ...args);
      if (typeof r === `object`) await r;
      trigger = performance.now();
    }
  };
};