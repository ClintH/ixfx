import { median } from "./average.js";
import type { RobustArrayOptions } from "./normalise-types.js";
import { interquartileRange } from "./iqr.js";

/**
 * Calculates 'robust scaling' of a single value, `x`, based on provided mean and standard deviation.
 * 
 * ```js
 * const m = median(someData);
 * const i = interquartileRange(someData);
 * const fn = compute(m, i);
 * 
 * // Use normaliser function
 * fn(10);
 * ```
 * If you want to calculate for a whole array, use {@link array}.
 * @param median Median of data
 * @param iqr Interquartile range of data
 * @returns 
 */
export const compute = (median: number, iqr: number) => (value: number): number => (value - median) / iqr;

/**
 * Returns the an array of normalised values, along with the mean and standard deviation of `array`.
 * If you just want the computed results, use {@link Normalise.Robust.array}.
 * 
 * By default it will compute mean and std.dev based on `array`. If you have these already, they
 * can be passed as options.
 * @param array 
 * @returns 
 */
export const arrayWithContext = (array: readonly number[] | number[], options: Partial<RobustArrayOptions> = {}): {
  median: number;
  iqr: number;
  values: number[];
  original: number[];
} => {
  if (!Array.isArray(array)) throw new TypeError(`Param 'array' is expected to be an array. Got: ${ typeof array }`);
  const m = options.medianForced ?? median(array);
  const iqr = options.iqrForced ?? interquartileRange(array);
  const fn = compute(m, iqr);
  const values = array.map(fn);
  return {
    median: m,
    iqr, values,
    original: array
  }
};

/**
 * Returns an array of normalised values using the 'z score' algorithm.
 * 
 * By default it will compute mean and std.dev based on `array`. If you have these already, they
 * can be passed as options.
 * @param values 
 * @param options 
 * @returns 
 */
export const array = (values: readonly number[] | number[], options: Partial<RobustArrayOptions> = {}): number[] => arrayWithContext(values, options).values;

