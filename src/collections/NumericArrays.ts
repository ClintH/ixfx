import {zip, filterBetween} from './Arrays.js';
import * as Easings from "../modulation/Easing.js";

/**
 * Applies a function to the elements of an array, weighting them based on their relative position.
 * 
 * ```js
 * // Six items
 * weight([1,1,1,1,1,1], Easings.gaussian());
 * 
 * // Yields:
 * // [0.02, 0.244, 0.85, 0.85, 0.244, 0.02]
 * ```
 * 
 * Function is expected to map (0..1) => (0..1), such as an {@link Easings.EasingFn}. The input to the
 * function is the relative position of an element, so the first element will use fn(0), the middle (0.5) and so on.
 * The output of the function s then multiplied by the original value.
 * 
 * In the below example (which is also the default if `fn` is not specified), it is just the
 * position which is used to proportion the contents.
 * 
 * ```js
 * weight([1,1,1,1,1,1], (relativePos) => relativePos);
 * // Yields:
 * // [0, 0.2, 0.4, 0.6, 0.8, 1]
 * ```
 * 
 * Non-numbers in `data` will be silently ignored.
 * @param data Data to process. Assumed to be an array of numbers
 * @param fn Function (number)=>number. Returns a weighting based on the given relative position. If unspecified (x) => x is used.
 */
export const weight = (data:readonly number[], fn?:(relativePos:number)=>number):readonly number[] => {
  const f = (fn === undefined) ? (x:number) => x : fn;
  const validNumbers = data.filter(d => typeof d === `number` && !Number.isNaN(d));
  return validNumbers.map((v:number, index:number) => v*f(index/(validNumbers.length-1)));
};


/**
 * Calculates the average of all numbers in an array.
 * Array items which aren't a valid number are ignored and do not factor into averaging.
 *
 * Use {@link minMaxAvg} if you want min, max and total as well.
 * 
 * @example
 * ```
 * // Average of a list
 * const avg = average(1, 1.4, 0.9, 0.1);
 * 
 * // Average of a variable
 * let data = [100,200];
 * average(...data);
 * ```
 * @param data Data to average.
 * @returns Average of array
 */
export const average = (...data: readonly number[]): number => {
  // ✔ UNIT TESTED
  if (data === undefined) throw new Error(`data parameter is undefined`);
  const validNumbers = data.filter(d => typeof d === `number` && !Number.isNaN(d));
  const total = validNumbers.reduce((acc, v) => acc + v, 0);
  return total / validNumbers.length;
};

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
 * averageWeighted[1,2,3], Easings.gaussian()); // 2.0
 * ```
 * 
 * This is the same as:
 * ```js
 * const data = [1,2,3];
 * const w = weight(data, Easings.gaussian());
 * const avg = averageWeighted(data, w); // 2.0
 * ```
 * @param data Data to average
 * @param weightings Array of weightings that match up to data array, or an easing function 
 */
export const averageWeighted = (data:readonly number[], weightings:(readonly number[])|Easings.EasingFn):number => {
  if (typeof weightings === `function`) weightings = weight(data, weightings);

  const ww = zip(data, weightings);
  const [totalV, totalW] = ww.reduce((acc, v:number[]) => [acc[0] + (v[0]*v[1]), acc[1] + v[1]], [0, 0]);
  return totalV/totalW;
};

/**
 * Returns the minimum number out of `data`.
 * Undefined and non-numbers are silently ignored.
 * @param data
 * @returns Minimum number
 */
export const min = (...data:readonly number[]):number => {
  const validNumbers = data.filter(d => typeof d === `number` && !Number.isNaN(d));
  return Math.min(...validNumbers);
};

/**
 * Returns the maximum number out of `data`.
 * Undefined and non-numbers are silently ignored.
 * @param data
 * @returns Maximum number
 */
export const max = (...data:readonly number[]):number => {
  const validNumbers = data.filter(d => typeof d === `number` && !Number.isNaN(d));
  return Math.max(...validNumbers);
};

/**
 * Returns the maximum out of `data` without additional processing for speed.
 * 
 * For most uses, {@link max} should suffice.
 * @param data 
 * @returns Maximum
 */
export const maxFast = (data:readonly number[]|Float32Array):number => {
  //eslint-disable-next-line functional/no-let
  let m = Number.MIN_SAFE_INTEGER;
  //eslint-disable-next-line functional/no-loop-statement,functional/no-let
  for (let i=0;i<data.length;i++) {
    m = Math.max(m, data[i]);
  }
  return m;
};

/**
 * Returns the min, max, avg and total of the array.
 * Any values that are invalid are silently skipped over.
 * 
 * Use {@link average} if you only need average
 * 
 * @param data
 * @param startIndex If provided, starting index to do calculations (defaults full range)
 * @param endIndex If provided, the end index to do calculations (defaults full range)
 * @returns `{min, max, avg, total}`
 */
export const minMaxAvg = (data: readonly number[], startIndex?:number, endIndex?:number): {
  /**
   * Smallest value in array
   */
  readonly min: number; 
  /**
   * Total of all items
   */
  readonly total: number; 
  /**
   * Largest value in array
   */
  readonly max: number; 
  /**
   * Average value in array
   */
  readonly avg: number;} => {

  if(data === undefined) throw new Error(`'data' is undefined`);
  if (!Array.isArray(data)) throw new Error(`'data' parameter is not an array`);
  
  if (startIndex === undefined) startIndex = 0;
  if (endIndex === undefined) endIndex = data.length;

  const validNumbers = filterBetween<number>(data, d => typeof d === `number` && !Number.isNaN(d), startIndex, endIndex);
  const total = validNumbers.reduce((acc, v) => acc + v, 0);
  return {
    total: total,
    max: Math.max(...validNumbers),
    min: Math.min(...validNumbers),
    avg: total / validNumbers.length
  };
};