import * as NumericArrays from './collections/NumericArrays.js';

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
 * See also: {@link Arrays.average} which takes an array.
 * @param data Data to average.
 * @returns Average of array
 */
export const average = (...numbers:readonly number[]) => NumericArrays.average(numbers);