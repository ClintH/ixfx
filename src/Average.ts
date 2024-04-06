import * as NumericArrays from './collections/arrays/NumericArrays.js';

import { averageWeighted as NumbersAverageWeighted } from './collections/arrays/AverageWeighted.js';
import { Easings } from './modulation/index.js';
/**
 * Calculates the average of all numbers in an array.
 * Array items which aren't a valid number are ignored and do not factor into averaging.

 * @example
 * ```
 * import * as Numbers from 'https://unpkg.com/ixfx/dist/numbers.js';
 * 
 * // Average of a list
 * const avg = Numbers.average(1, 1.4, 0.9, 0.1);
 * 
 * // Average of a variable
 * let data = [100,200];
 * Numbers.average(...data);
 * ```
 * 
 * See also: [Arrays.average](Collections.Arrays.average.html) which takes an array.
 * @param data Data to average.
 * @returns Average of array
 */
export const average = (...numbers: ReadonlyArray<number>) =>
  NumericArrays.average(numbers);

/**
 * See [Arrays.averageWeighted](Collections.Arrays.averageWeighted.html)
 * @param weightings
 * @param numbers
 * @returns
 */
export const averageWeighted = (
  weightings: Array<number> | ReadonlyArray<number> | Easings.EasingFn,
  ...numbers: Array<number> | ReadonlyArray<number>
): number => NumbersAverageWeighted(numbers, weightings);