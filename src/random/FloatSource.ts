
import { type RandomOptions, type RandomSource, defaultRandom } from "./Types.js";
import { throwNumberTest } from '../util/GuardNumbers.js';
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
export const floatSource = (maxOrOptions: number | RandomOptions = 1): RandomSource => {
  const options = typeof maxOrOptions === `number` ? { max: maxOrOptions } : maxOrOptions;
  //eslint-disable-next-line functional/no-let
  let max = options.max;
  //eslint-disable-next-line functional/no-let
  let min = options.min ?? 0;
  const source = options.source ?? defaultRandom;

  throwNumberTest(min, ``, `min`);
  throwNumberTest(max, ``, `max`);

  if (!options.min && max < 0) {
    min = max;
    max = 0;
  }
  if (min > max) {
    throw new Error(`Min is greater than max. Min: ${ min } max: ${ max }`);
  }

  return () => source() * (max - min) + min;
};