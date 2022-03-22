import {minMaxAvg} from "../collections/NumericArrays.js";
import {clamp, scale} from "../Util.js";

/**
 * Normalises numbers, adjusting min/max as new values are processed.
 * Normalised return values will be in the range of 0-1 (inclusive).
 * 
 * @example
 * ```js
 * const s = stream();
 * s(2);    // 1 (because 2 is highest seen)
 * s(1);    // 0 (because 1 is the lowest so far)
 * s(1.5);  // 0.5 (50% of range 1-2)
 * s(0.5);  // 0 (because it's the new lowest)
 * ```
 * 
 * Since normalisation is being adjusted as new min/max are encountered, it might
 * be that value normalised to 1 at one time is different to what normalises to 1
 * at a later time.
 * 
 * If you already know what to expect of the number range, passingin `minDefault` 
 * and `maxDefault` primes the normalisation.
 * ```js
 * const s = stream();
 * s(5); // 1, because it's the highest seen
 * 
 * // With priming:
 * const s = stream(0, 10);
 * s(5); // 0.5, because we're expecting range 0-10
 * ```
 * 
 * Note that if a value exceeds the default range, normalisation adjusts.
 * @returns 
 */
export const stream = (minDefault?:number, maxDefault?:number) => {
  //eslint-disable-next-line functional/no-let
  let min = minDefault ?? Number.MAX_SAFE_INTEGER;
  //eslint-disable-next-line functional/no-let
  let max = maxDefault ?? Number.MIN_SAFE_INTEGER;

  return (v:number):number => {
    min = Math.min(min, v);
    max = Math.max(max, v);
    return scale(v, min, max);
  };
};

/**
 * Normalises an array. By default uses the actual min/max of the array
 * as the normalisation range.
 * 
 * ```js
 * // Yields: [0.5, 0.1, 0.0, 0.9, 1]
 * array([5,1,0,9,10]);
 * ```
 * 
 * `minForced` and/or `maxForced` can
 * be provided to use an arbitrary range. 
 * ```js
 * // Forced range 0-100
 * // Yields: [0.05, 0.01, 0.0, 0.09, 0.10]
 * array([5,1,0,9,10], 0, 100);
 * ```
 * 
 * Return values are clamped to always be 0-1, inclusive.
 * 
 * @param values Values
 * @param minForced If provided, this will be min value used
 * @param maxForced If provided, this will be the max value used
 */
export const array = (values:readonly number[], minForced?:number, maxForced?:number) => {
  if (!Array.isArray(values)) throw new Error(`values param should be an array`);
  const mma = minMaxAvg(values);

  const min = minForced ?? mma.min;
  const max = maxForced ?? mma.max;

  return values.map(v => clamp(scale(v, min, max)));
};