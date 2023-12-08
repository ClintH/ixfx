import { type IsEqual, isEqualValueDefault } from "../../IsEqual.js";

/**
 * Returns _true_ if the contents of the array are all the same.
 * Uses value-based equality checking by default.
 * 
 * @example Uses default equality function:
 * ```js
 * import { valuesEqual } from 'https://unpkg.com/ixfx/dist/arrays.js';
 *
 * const a1 = [ 10, 10, 10 ];
 * valuesEqual(a1); // True
 *
 * const a2 = [ { name:`Jane` }, { name:`John` } ];
 * valuesEqual(a2); // True, even though object references are different
 * ```
 *
 * If we want to compare by value for objects that aren't readily
 * converted to JSON, you need to provide a function:
 *
 * ```js
 * valuesEqual(someArray, (a, b) => {
 *  return (a.eventType === b.eventType);
 * });
 * ```
 *
 * Returns _true_ if `array` is empty.
 * @param array Array
 * @param equality Equality checker. Uses string-conversion checking by default
 * @returns
 */
export const valuesEqual = <V>(
  //eslint-disable-next-line functional/prefer-readonly-type
  array: ReadonlyArray<V> | Array<V>,
  equality?: IsEqual<V>
): boolean => {
  // Unit tested

  if (!Array.isArray(array)) throw new Error(`Param 'array' is not an array.`);
  if (array.length === 0) return true;
  const eq = equality ?? isEqualValueDefault;
  const a = array[ 0 ];
  const r = array.some((v) => !eq(a, v));
  if (r) return false;
  return true;
};