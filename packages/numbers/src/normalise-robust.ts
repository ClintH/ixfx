import { numberTest, resultThrow } from "@ixfx/guards";
import { mean, median } from "./average.js";
import type { NormaliseStreamContext, RobustArrayOptions, ZScoreArrayOptions } from "./normalise-types.js";
import { standardDeviation } from "./standard-deviation.js";
import { interquartileRange } from "./iqr.js";

/**
 * Calculates 'robus scaling' of a single value, `x`, based on provided mean and standard deviation.
 * 
 * If you want to calculate for a whole array, use {@link array}.
 * @param x Value to normalise
 * @param mean Mean of data
 * @param standardDeviation Standard deviation of data
 * @returns 
 */
export const single = (value: number, median: number, iqr: number) => (value - median) / iqr;

/**
 * Returns the an array of normalised values, along with the mean and standard deviation of `array`.
 * If you just want the computed results, use {@link array}.
 * 
 * By default it will compute mean and std.dev based on `array`. If you have these already, they
 * can be passed as options.
 * @param array 
 * @returns 
 */
export const arrayWithContext = (array: readonly number[] | number[], options: Partial<RobustArrayOptions> = {}) => {
  const m = options.medianForced ?? median(array);
  const iqr = options.iqrForced ?? interquartileRange(array as number[]);
  const values = array.map(value => single(value as number, m, iqr));
  return {
    median: m,
    iqr, values
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
export const array = (values: readonly number[] | number[], options: Partial<RobustArrayOptions> = {}) => arrayWithContext(values, options).values;

