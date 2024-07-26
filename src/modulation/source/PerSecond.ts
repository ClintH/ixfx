import type { ModSource } from "../Types.js";

/**
 * Returns a proportion of `amount` depending on elapsed time.
 * The idea being that cumulatively, `amount` is yielded every second.
 * 
 * ```js
 * // Calculate a proportion of 0.1 every second
 * const x = perSecond(0.1);
 * x();
 * ```
 * 
 * The faster `x()` is called, the smaller the chunks of `amount` are returned.
 * Values accumulate. For example, `x()` isn't called for two seconds, 2*amount is returned.
 * 
 * @example Usage
 * ```js
 * const settings = {
 *  ageMod: perSecond(0.1);
* };
 * 
 * let state = {
 *  age: 1
 * };
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
export const perSecond = (amount: number, options: Partial<{ max: number, min: number }> = {}): ModSource => {
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

/**
 * As {@link perSecond}, but per minute.
 * @param amount 
 * @param options 
 * @returns 
 */
export const perMinute = (amount: number, options: Partial<{ max: number, min: number }> = {}): ModSource => {
  return perSecond(amount / 60, options);
}