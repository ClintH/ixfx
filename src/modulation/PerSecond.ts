import { relativeTimer } from "src/flow/index.js"

/**
 * Returns a proportion of `amount` depending on elapsed time.
 * ```js
 * // Calculate a proportion of 0.1 every second
 * const x = perSecond(0.1);
 * x();
 * ```
 * 
 * The faster `x()` is called, the smaller the chunks of `amount` are returned.
 * Values accumulate. If, for example `x()` isn't called for two seconds, 2*amount is returned.
 * 
 * @example Usage
 * ```js
 * const settings = Object.freeze({
 *  ageMod: perSecond(0.1);
* });
 * 
 * let state = Object.freeze({
 *  age: 1
 * });
 * 
 * // Update
 * setInterval(() => {
 *  let { age } = state;
 *  // Add 0.1 per second, regardless of 
 *  // loop speed
 *  age += settings.ageMod(); 
 *  state = {
 *    ...state,
 *    age: clamp(age)
 *  }
 * });
 * ```
 * 
 * Options:
 * * max: if specified, the max return value
 * * min: if specified, the min return value
 * @param amount
 * @returns 
 */
export const perSecond = (amount: number, options: Partial<{ max: number, min: number }> = {}) => {
  const perMilli = amount / 1000;
  const min = options.min ?? Number.MIN_SAFE_INTEGER;
  const max = options.max ?? Number.MAX_SAFE_INTEGER;
  let called = performance.now();

  return () => {
    const now = performance.now();
    const elapsed = now - called;
    called = now;
    const x = perMilli * elapsed;
    if (x > max) return max;
    if (x < min) return min;
    return x;
  }
}