import { numberTest, resultThrow } from "@ixfx/guards";
import { mean } from "./average.js";
import type { NormaliseStreamContext, ZScoreArrayOptions } from "./normalise-types.js";
import { standardDeviation } from "./standard-deviation.js";

/**
 * Returns a function that computes zscore-based normalisation.
 * 
 * ```js
 * // Calculate necessary components
 * const m = mean(data);
 * const s = standardDeviation(data);
 * 
 * // Get the function
 * const fn = compute(m, s);
 * 
 * // Use it
 * fn(10); // Yields the normalised value
 * ```
 * 
 * It can be used to normalise a whole array
 * ```js
 * const normalised = someData.map(fn);
 * ```
 * 
 * If you want to calculate for a whole array, use {@link array}.
 * @param mean Mean of data
 * @param standardDeviation Standard deviation of data
 * @returns 
 */
export const compute = (mean: number, standardDeviation: number) => (value: number): number => (value - mean) / standardDeviation;

/**
 * Returns the an array of normalised values, along with the mean and standard deviation of `array`.
 * If you just want the computed results, use {@link Normalise.ZScore.array}.
 * 
 * By default it will compute mean and std.dev based on `array`. If you have these already, they
 * can be passed as options.
 * @param array 
 * @returns 
 */
export const arrayWithContext = (array: readonly number[] | number[], options: Partial<ZScoreArrayOptions> = {}): {
  mean: number;
  standardDeviation: number;
  values: number[];
  original: readonly number[] | number[];
} => {
  const m = options.meanForced ?? mean(array);
  const s = options.standardDeviationForced ?? standardDeviation(array as number[]);
  const fn = compute(m, s);
  const results = array.map(fn);
  return {
    mean: m,
    standardDeviation: s,
    values: results,
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
export const array = (values: readonly number[] | number[], options: Partial<ZScoreArrayOptions> = {}): number[] => arrayWithContext(values, options).values;

