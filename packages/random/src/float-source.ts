import { throwNumberTest } from '@ixfx/guards';
import { type RandomOptions, type RandomSource } from "./types.js";

/**
 * Source for random bipolar values
 * ```js
 * const r = bipolarSource();
 * r(); // Produce random value on -1...1 scale
 * ```
 * 
 * Options can be provided, for example
 * ```js
 * // -0.5 to 0.5 range
 * bipolarSource({ max: 0.5 });
 * ```
 * 
 * 
 * @param maxOrOptions Maximum value (number) or options for random generation
 * @returns 
 */
export const bipolarSource = (maxOrOptions?: number | RandomOptions): RandomSource => {
  const source = floatSource(maxOrOptions);
  return () => (source() * 2) - 1;
}

/**
 * Returns a random bipolar value
 * ```js
 * const r = bipolar(); // -1...1 random
 * ```
 * 
 * Options can be provided, eg.
 * ```js
 * bipolar({ max: 0.5 }); // -0.5..0.5 random
 * ```
 * 
 * Use {@link bipolarSource} if you want to generate random
 * values with same settings repeatedly.
 * @param maxOrOptions 
 * @returns 
 */
export const bipolar = (maxOrOptions?: number | RandomOptions): number => {
  const source = bipolarSource(maxOrOptions);
  return source();
}

/**
 * Returns a function that produces random float values.
 * Use {@link float} to produce a valued directly.
 *
 * Random float between `max` (exclusive) and 0 (inclusive). Max is 1 if unspecified.
 *
 *
 * ```js
 * // Random number between 0..1 (but not including 1)
 * // (this would be identical to Math.random())
 * const r = floatSource();
 * r(); // Execute to produce random value
 *
 * // Random float between 0..100 (but not including 100)
 * const v = floatSource(100)();
 * ```
 *
 * Options can be used:
 * ```js
 * // Random float between 20..40 (possibly including 20, but always lower than 40)
 * const r = floatSource({ min: 20, max: 40 });
 * ```
 * @param maxOrOptions Maximum value (exclusive) or options
 * @returns Random number
 */
export const floatSource = (maxOrOptions: (number | RandomOptions) = 1): RandomSource => {
  const options = typeof maxOrOptions === `number` ? { max: maxOrOptions } : maxOrOptions;
  let max = options.max ?? 1;
  let min = options.min ?? 0;
  const source = options.source ?? Math.random;

  throwNumberTest(min, ``, `min`);
  throwNumberTest(max, ``, `max`);

  if (!options.min && max < 0) {
    min = max;
    max = 0;
  }
  if (min > max) {
    throw new Error(`Min is greater than max. Min: ${ min.toString() } max: ${ max.toString() }`);
  }

  return () => source() * (max - min) + min;
};

/**
 * Returns a random float between `max` (exclusive) and 0 (inclusive). Max is 1 if unspecified.
 * Use {@link floatSource} to get a function that produces values. This is used internally.
 *
 * ```js
 * // Random number between 0..1 (but not including 1)
 * // (this would be identical to Math.random())
 * const v = float();
 * // Random float between 0..100 (but not including 100)
 * const v = float(100);
 * ```
 *
 * Options can be used:
 * ```js
 * // Random float between 20..40 (possibly including 20, but always lower than 40)
 * const v = float({ min: 20, max: 40 });
 * ```
 * @param maxOrOptions Maximum value (exclusive) or options
 * @returns Random number
 */
export const float = (maxOrOptions: (number | RandomOptions) = 1): number =>
  floatSource(maxOrOptions)();