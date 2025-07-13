import type { ModSource } from "../types.js";

/**
 * Returns a proportion of `amount` depending on elapsed time.
 * Cumulatively, `amount` is yielded every second.
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
 * Use the `clamp` option so the returned value never exceeds `amount`.
 * Alternatively, `min`/`max` options allow you to set arbitrary limits.
 * @param amount
 * @returns 
 */
export const perSecond = (amount: number, options: Partial<{ clamp: boolean, max: number, min: number }> = {}): ModSource => {
  const perMilli = amount / 1000;
  let min = options.min ?? Number.MIN_SAFE_INTEGER;
  let max = options.max ?? Number.MAX_SAFE_INTEGER;
  const clamp = options.clamp ?? false;
  if (clamp && options.max) throw new Error(`Use either 'max' or 'clamp', not both.`);
  if (clamp) max = amount;
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
export const perMinute = (amount: number, options: Partial<{ clamp: boolean, max: number, min: number }> = {}): ModSource => {
  return perSecond(amount / 60, options);
}