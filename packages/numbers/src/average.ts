import { zip } from '@ixfx/arrays';
import { weight } from './numeric-arrays.js';



/**
 * Calculate median value of an array of numbers
 * @param data 
 * @returns 
 */
export const median = (data: number[] | readonly number[]) => {
  // https://www.geeksforgeeks.org/dsa/mean-and-median-of-an-unsorted-array/
  if (!Array.isArray(data)) throw new TypeError(`Param 'data' is expected to be an array`);
  const n = data.length;

  data.sort((a, b) => a - b);
  let result = 0;

  if (n % 2 === 0) {
    // if there are two middle element 
    result = Math.floor((data[ n / 2 ] + data[ (n / 2) - 1 ]) / 2);
  } else {
    // if there are only one middle element 
    result = data[ Math.floor(n / 2) ];
  }
  return result;
}

/**
 * Calculate the mean of `array`.
 * @param array 
 * @returns 
 */
export const mean = (array: number[] | readonly number[]) => array.reduce((accumulator, value) => accumulator + value, 0) / array.length;

/**
 * Computes an average of an array with a set of weights applied.
 *
 * Weights can be provided as an array, expected to be on 0..1 scale, with indexes
 * matched up to input data. Ie. data at index 2 will be weighed by index 2 in the weightings array.
 *
 * ```js
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
 * averageWeighted[1,2,3], Random.gaussian()); // 2.0
 * ```
 *
 * This is the same as:
 *
 * ```js
 * const data = [1,2,3];
 * const w = weight(data, Random.gaussian());
 * const avg = averageWeighted(data, w); // 2.0
 * ```
 * @param data Data to average
 * @param weightings Array of weightings that match up to data array, or an easing function
 * @see {@link average} Compute averages without weighting.
 */
export const averageWeighted = (
  data: number[] | readonly number[],
  weightings: number[] | readonly number[] | ((value: number) => number)
): number => {
  if (typeof weightings === `function`) weightings = weight(data, weightings);
  const ww = zip(data, weightings);
  const [ totalV, totalW ] = ww.reduce(
    (accumulator: number[], v: number[]) => [ accumulator[ 0 ] + v[ 0 ] * v[ 1 ], accumulator[ 1 ] + v[ 1 ] ],
    [ 0, 0 ]
  );
  return totalV / totalW;
};