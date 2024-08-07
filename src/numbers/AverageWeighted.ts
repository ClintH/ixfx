import { zip } from '../data/arrays/Zip.js';
import { weight } from './NumericArrays.js';
/**
 * Computes an average of an array with a set of weights applied.
 *
 * Weights can be provided as an array, expected to be on 0..1 scale, with indexes
 * matched up to input data. Ie. data at index 2 will be weighed by index 2 in the weightings array.
 *
 * ```js
 * import { averageWeighted } from 'https://unpkg.com/ixfx/dist/numbers.js';
 * // All items weighted evenly
 * averageWeighted([1,2,3], [1,1,1]); // 2
 *
 * // First item has full weight, second half, third quarter
 * averageWeighted([1,2,3], [1, 0.5, 0.25]); // 1.57
 *
 * // With reversed weighting of [0.25,0.5,1] value is 2.42
 * ```
 *
 * A function can alternatively be provided to compute the weighting based on array index, via {@link weight}.
 *
 * ```js
 * import { weight,averageWeighted } from 'https://unpkg.com/ixfx/dist/numbers.js';
 * import { gaussian } from 'https://unpkg.com/ixfx/dist/modulation.js';
 * averageWeighted[1,2,3], gaussian()); // 2.0
 * ```
 *
 * This is the same as:
 *
 * ```js
 * import { weight,averageWeighted } from 'https://unpkg.com/ixfx/dist/numbers.js';
 * import { gaussian } from 'https://unpkg.com/ixfx/dist/modulation.js';
 *
 * const data = [1,2,3];
 * const w = weight(data, gaussian());
 * const avg = averageWeighted(data, w); // 2.0
 * ```
 * @param data Data to average
 * @param weightings Array of weightings that match up to data array, or an easing function
 * @see {@link average} Compute averages without weighting.
 */
export const averageWeighted = (
  data: Array<number> | ReadonlyArray<number>,
  weightings: Array<number> | ReadonlyArray<number> | ((value: number) => number)
): number => {
  if (typeof weightings === `function`) weightings = weight(data, weightings);
  const ww = zip(data, weightings);
  // eslint-disable-next-line unicorn/no-array-reduce
  const [ totalV, totalW ] = ww.reduce(
    (accumulator: Array<number>, v: Array<number>) => [ accumulator[ 0 ] + v[ 0 ] * v[ 1 ], accumulator[ 1 ] + v[ 1 ] ],
    [ 0, 0 ]
  );
  return totalV / totalW;
};