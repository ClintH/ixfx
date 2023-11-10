/**
 * Throws an error if `array` parameter is not a valid array
 *
 * ```js
 * import { guardArray } from 'https://unpkg.com/ixfx/dist/arrays.js';
 * guardArray(someVariable);
 * ```
 * @private
 * @param array
 * @param name
 */
export const guardArray = <V>(array: ArrayLike<V>, name = `?`) => {
  if (array === undefined) {
    throw new TypeError(`Param '${ name }' is undefined. Expected array.`);
  }
  if (array === null) {
    throw new TypeError(`Param '${ name }' is null. Expected array.`);
  }
  if (!Array.isArray(array)) {
    throw new TypeError(`Param '${ name }' not an array as expected`);
  }
};
