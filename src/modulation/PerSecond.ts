/**
 * Returns a proportion of `amount` depending on elapsed time.
 * ```js
 * const x = perSecond(0.1);
 * x();
 * ```
 * 
 * The faster `x()` is called, the smaller the chunks of `amount` are returned.
 * 
 * @example Usage example
 * ```js
 * const settings = {
 *  ageMod: perSecond(0.1);
 * }
 * let state = {
 *  age: 1
 * }
 * 
 * // Update
 * setInterval(() => {
 *  let { age } = state;
 *  // Add 0.1 per second, regardless of 
 *  // loop speed
 *  age += settings.ageMod(); 
 *  state = {
 *    ...state,
 *    age
 *  }
 * });
 * ```
 * @param amount
 * @returns 
 */
export const perSecond = (amount: number) => {
  const perMilli = amount / 1000;
  let called = performance.now();

  return () => {
    const elapsed = performance.now() - called;
    called = performance.now();
    return perMilli * elapsed;
  }
}