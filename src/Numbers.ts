import * as NumericArrays from './collections/NumericArrays.js';
import {numberTracker} from './data/NumberTracker.js';
import {TrackedValueOpts} from './data/TrackedValue.js';
import {Easings} from './modulation/index.js';

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
export const average = (...numbers:readonly number[]) => NumericArrays.average(numbers);

/**
 * See [Arrays.averageWeighted](Collections.Arrays.averageWeighted.html)
 * @param weightings 
 * @param numbers 
 * @returns 
 */
export const averageWeighted = (weightings:(readonly number[])|Easings.EasingFn, ...numbers:readonly number[]):number => NumericArrays.averageWeighted(numbers, weightings);

/**
 * Returns the minimum number out of `data`.
 * Undefined and non-numbers are silently ignored.
 * 
 * ```js
 * import * as Numbers from 'https://unpkg.com/ixfx/dist/numbers.js';
 * Numbers.min(10, 20, 0); // Yields 0
 * ```
 * @param data
 * @returns Minimum number
 */
export const min = (...data:readonly number[]):number => NumericArrays.min(data);


/**
 * Returns the maximum number out of `data`.
 * Undefined and non-numbers are silently ignored.
 * 
 * ```js
 * import * as Numbers from 'https://unpkg.com/ixfx/dist/numbers.js';
 * Numbers.max(10, 20, 0); // Yields 20
 * ```
 * @param data
 * @returns Maximum number
 */
export const max = (...data:readonly number[]):number => NumericArrays.max(data);


/**
 * Returns the total of `data`.
 * Undefined and non-numbers are silently ignored.
 * 
 * ```js
 * import * as Numbers from 'https://unpkg.com/ixfx/dist/numbers.js';
 * Numbers.total(10, 20, 0); // Yields 30
 * ```
 * @param data
 * @returns Total
 */
export const total = (...data:readonly number[]):number => NumericArrays.total(data);

/**
 * Returns true if `possibleNumber` is a number and not NaN
 * @param possibleNumber 
 * @returns 
 */
export const isValid = (possibleNumber:number|unknown) => {
  if (typeof possibleNumber !== `number`) return false;
  if (Number.isNaN(possibleNumber)) return false;
  return true;
}; 

/**
 * Alias for [Data.numberTracker](Data.numberTracker.html) 
 */
export const tracker = (id?:string, opts?:TrackedValueOpts) => numberTracker(id, opts);

/**
 * Filters an iterator of values, only yielding
 * those that are valid numbers
 * 
 * ```js
 * import * as Numbers from 'https://unpkg.com/ixfx/dist/numbers.js';
 * 
 * const data = [true, 10, '5', { x: 5 }];
 * for (const n of Numbers.filter(data)) {
 *  // 5
 * }
 * ```
 * @param it 
 */
//eslint-disable-next-line func-style
export function* filter(it:Iterable<unknown>) {
  for (const v of it) {
    if (isValid(v)) yield v;
  }
}

