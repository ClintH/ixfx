import { isEqualDefault, isEqualValueDefault, type IsEqual } from "./util/is-equal.js";
import { arrayTest, resultThrow } from "@ixfx/guards";

/**
 * Returns _true_ if the two arrays have the same items at same indexes. 
 * 
 * Returns _false_ if arrays are of different length.
 * By default uses === semantics for equality checking.
 * 
 * ```js
 * isEqual([ 1, 2, 3], [ 1, 2, 3 ]); // true
 * isEqual([ 1, 2, 3], [ 3, 2, 1 ]); // false
 * ```
 * 
 * Compare by value
 * ```js
 * isEqual(a, b, isEqualValueDefault);
 * ```
 * 
 * Custom compare, eg based on `name` field:
 * ```js
 * isEqual(a, b, (compareA, compareB) => compareA.name === compareB.name);
 * ```
 * @param arrayA 
 * @param arrayB 
 * @param equality Function to compare values
 */
export const isEqual = <V>(arrayA: V[], arrayB: V[], equality = isEqualDefault<V>): boolean => {
  // TODO: 'eq' function could be a key-generating function too
  resultThrow(
    arrayTest(arrayA, `arrayA`),
    arrayTest(arrayB, `arrayB`)
  );

  if (arrayA.length !== arrayB.length) return false;

  for (let indexA = 0; indexA < arrayA.length; indexA++) {
    if (!(equality(arrayA[ indexA ], arrayB[ indexA ]))) return false;
  }
  return true;
}

/**
 * Returns _true_ if all values in the array are the same. Uses value-based equality checking by default.
 * 
 * @example Using default equality function
 * ```js
 * const a1 = [ 10, 10, 10 ];
 * containsIdenticalValues(a1); // True
 *
 * const a2 = [ { name:`Jane` }, { name:`John` } ];
 * containsIdenticalValues(a2); // True, even though object references are different
 * ```
 *
 * If we want to compare by value for objects that aren't readily
 * converted to JSON, you need to provide a function:
 *
 * ```js
 * containsIdenticalValues(someArray, (a, b) => {
 *  return (a.eventType === b.eventType);
 * });
 * ```
 *
 * Returns _true_ if `array` is empty.
 * @param array Array
 * @param equality Equality checker. Uses string-conversion checking by default
 * @returns
 */
export const containsIdenticalValues = <V>(
  array: readonly V[] | V[],
  equality?: IsEqual<V>
): boolean => {
  // TODO: 'equality' function could be a key-generating function too

  if (!Array.isArray(array)) throw new Error(`Param 'array' is not an array.`);
  if (array.length === 0) return true;
  const eq = equality ?? isEqualValueDefault;
  const a = array[ 0 ];
  const r = array.some((v) => !eq(a, v));
  if (r) return false;
  return true;
};