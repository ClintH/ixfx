import { interpolate } from "src/numbers/Interpolate.js";
import type { Modulate } from "./Types.js";

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

/**
 * Returns a mix of two modulate functions which are
 * both given the same input value.
 *
 * ```js
 * import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
 * // Get a 50/50 mix of two easing functions
 * const mix = Easings.mix(0.5, Easings.Named.sineIn, Easings.Named.sineOut);
 *
 * // 10% of sineIn, 90% of sineOut
 * Easings.mix(0.90, 0.25, Easings.Named.sineIn, Easings.Named.sineOut);
 * ```
 * @param balance Mix between a and b
 * @param a
 * @param b
 * @returns Numeric value
 */
export const mixModulators = (
  balance: number,
  a: Modulate,
  b: Modulate
): Modulate => (amt: number) => interpolate(balance, a(amt), b(amt));

/**
 * Returns a 'crossfade' of two easing functions, synchronised with the progress through the easing. That is:
 * * 0.0 will yield 100% of easingA at its `easing(0)` value.
 * * 0.2 will yield 80% of a, 20% of b, with both at their `easing(0.2)` values
 * * 0.5 will yield 50% of both functions both at their `easing(0.5)` values
 * * 0.8 will yield 20% of a, 80% of a, with both at their `easing(0.8)` values
 * * 1.0 will yield 100% of easingB at its `easing(1)` value.
 *
 * So easingB will only ever kick in at higher `amt` values and `easingA` will only be present in lower valus.
 *
 * ```js
 * import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
 * Easings.crossFade(0.5, Easings.Named.sineIn, Easings.Named.sineOut);
 * ```
 * @param a
 * @param b
 * @returns Numeric value
 */
export const crossfade = (a: Modulate, b: Modulate): Modulate => {
  return (amt: number) => {
    const mixer = mixModulators(amt, a, b);
    return mixer(amt);
  }
}