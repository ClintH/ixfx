import { interpolate } from "@ixfxfun/numbers";
import type { Modulate } from "./types.js";

/**
 * Mixes in modulation. This is used when you want to
 * fold in a controllable amount of modulation.
 * 
 * For example, we have a base value of 0.5 (50%) that we want to modulate
 * by 0.9 (90%). That is, reduce its value by 10%. `mix` allows us
 * to slowly ramp up to the fully modulated value.
 * 
 * ```js
 * import { mix } from 'https://unpkg.com/ixfx/dist/modulation.js'
 * // When 'amt' is 0, modulation doesn't affect value at all,
 * // original is returned
 * mix(0, 0.5, 0.9); // 0.5
 * // Mixing in 50% of modulation
 * mix(0.5, 0.5, 0.9); // 0.475
 * // All modulation applied, so now we get 90% of 0.5
 * mix(1, 0.5, 0.9); // 0.45 (ie. 90% of 0.5)
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
 * Returns a modulator that mixes between two modulation functions.
 * Both modulators are given the same input value.
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
 * Returns a 'crossfader` function of two easing functions, synchronised with the progress through the easing.
 * 
 * Example `amt` values:
 * * 0.0 will yield 100% of easingA at its `easing(0)` value.
 * * 0.2 will yield 80% of easingA, 20% of easingB, both at their `easing(0.2)` values
 * * 0.5 will yield 50% of both functions both at their `easing(0.5)` values
 * * 0.8 will yield 20% of easingA, 80% of easingB, with both at their `easing(0.8)` values
 * * 1.0 will yield 100% of easingB at its `easing(1)` value.
 *
 * So easingB will only ever kick in at higher `amt` values and `easingA` will only be present in lower values.
 *
 * ```js
 * import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
 * Easings.crossFade(0.5, Easings.Named.sineIn, Easings.Named.sineOut);
 * ```
 * @param a Easing A
 * @param b Easing B
 * @returns Numeric value
 */
export const crossfade = (a: Modulate, b: Modulate): Modulate => {
  return (amt: number) => {
    const mixer = mixModulators(amt, a, b);
    return mixer(amt);
  }
}