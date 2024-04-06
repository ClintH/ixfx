import * as NumericArrays from '../collections/arrays/NumericArrays.js';

export function average(...values: Array<number>): number {
  return NumericArrays.average(values);
}

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
export const min = (...data: ReadonlyArray<number>): number =>
  NumericArrays.min(data);

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
export const max = (...data: ReadonlyArray<number>): number =>
  NumericArrays.max(data);

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
export const total = (...data: ReadonlyArray<number>): number =>
  NumericArrays.total(data);

