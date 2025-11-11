import { numberTest, resultThrow } from "@ixfx/guards";
import { mean } from "./average.js";
import type { NormaliseStreamContext, ZScoreArrayOptions } from "./normalise-types.js";
import { standardDeviation } from "./standard-deviation.js";

/**
 * Calculates 'z score' of a single value, `x`, based on provided mean and standard deviation.
 * 
 * If you want to calculate for a whole array, use {@link array}.
 * @param x Value to normalise
 * @param mean Mean of data
 * @param standardDeviation Standard deviation of data
 * @returns 
 */
export const single = (x: number, mean: number, standardDeviation: number) => (x - mean) / standardDeviation;

/**
 * Returns the an array of normalised values, along with the mean and standard deviation of `array`.
 * If you just want the computed results, use {@link array}.
 * 
 * By default it will compute mean and std.dev based on `array`. If you have these already, they
 * can be passed as options.
 * @param array 
 * @returns 
 */
export const arrayWithContext = (array: readonly number[] | number[], options: Partial<ZScoreArrayOptions> = {}) => {
  const m = options.meanForced ?? mean(array);
  const s = options.standardDeviationForced ?? standardDeviation(array as number[]);
  const results = array.map(x => single(x as number, m, s));
  return {
    mean: m,
    standardDeviation: s,
    values: results
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
export const array = (values: readonly number[] | number[], options: Partial<ZScoreArrayOptions> = {}) => arrayWithContext(values, options).values;

