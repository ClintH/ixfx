/**
 * Mixes in modulation
 * 
 * ```js
 * // Modulates the value of 100 by 90% at 100% strength 
 * mix(1, 0.5, 0.9);
 * ```
 * @param amount Amount of modulation (0..1). 0 means modulation value has no effect
 * @param original Original value to modulate
 * @param modulation Modulation amount (0..1)
 * @returns 
 */
export const mix = (amount: number, original: number, modulation: number) => {
  const m = modulation * amount;
  const base = (1 - amount) * original;
  return base + (original * m);
};
