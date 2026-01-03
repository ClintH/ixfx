import { intersection } from "./intersection.js";
import { isEqualDefault, isEqualValueDefault, type IsEqual } from "./util/is-equal.js";
import { arrayTest, functionTest, resultThrow } from "@ixfx/guards";

/**
 * Returns _true_ if the two arrays have the same length, and have the same items at the same indexes. 
 * 
 * By default uses === semantics for equality checking.
 * 
 * Use {@link isEqualIgnoreOrder} if you don't care whether items are in same order.
 * 
 * ```js
 * isEqual([ 1, 2, 3], [ 1, 2, 3 ]); // true
 * isEqual([ 1, 2, 3], [ 3, 2, 1 ]); // false
 * ```
 * 
 * Compare by value instead:
 * ```js
 * // Eg. compare objects based on their 'name' property
 * isEqual(a, b, v => v.name);
 * ```
 * 
 * @param arrayA 
 * @param arrayB 
 * @param comparerOrKey Function to compare values or produce a string key
 * @throws {TypeError} If inputs are not arrays
 */
export function isEqual<T>(arrayA: T[], arrayB: T[], comparerOrKey: IsEqual<T> | ((value: T) => string) = isEqualDefault): boolean {
  resultThrow(
    arrayTest(arrayA, `arrayA`),
    arrayTest(arrayB, `arrayB`),
    functionTest(comparerOrKey)
  );

  if (arrayA.length !== arrayB.length) return false;

  // Test function
  const test = comparerOrKey(arrayA[ 0 ], arrayB[ 0 ]);
  if (typeof test === `string`) {
    // Key based
    const c = comparerOrKey as (v: T) => string
    for (let indexA = 0; indexA < arrayA.length; indexA++) {
      const keyA = c(arrayA[ indexA ]);
      const keyB = c(arrayB[ indexA ]);
      if (keyA !== keyB) return false;
    }
  } else {
    // Comparer function
    const c = comparerOrKey as IsEqual<T>
    for (let indexA = 0; indexA < arrayA.length; indexA++) {
      if (!(c(arrayA[ indexA ], arrayB[ indexA ]))) return false;
    }
  }
  return true;
}

/**
 * Returns _true_ if arrays contain same value items, regardless of order. Will return _false_ if
 * arrays are of different length.
 * 
 * By default uses === semantics to compare items. Pass in a comparer function or key generating function otherwise:
 * ```js
 * isEqualIgnoreOrder(arrayA, arrayB, (v) => v.name);
 * ```
 * 
 * @param arrayA Array
 * @param arrayB Array
 * @param comparerOrKey Function to compare objects or produce a string representation. Defaults to {@link isEqualDefault}
 * @throws {TypeError} If input parameters are not correct
 */
export function isEqualIgnoreOrder<T>(arrayA: T[], arrayB: T[], comparerOrKey: IsEqual<T> | ((value: T) => string) = isEqualDefault): boolean {
  resultThrow(
    arrayTest(arrayA, `arrayA`),
    arrayTest(arrayB, `arrayB`),
    functionTest(comparerOrKey)
  );
  if (arrayA.length !== arrayB.length) return false;
  const arrayIntersection = intersection(arrayA, arrayB, comparerOrKey);
  return (arrayIntersection.length === arrayA.length)
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
 * @throws {TypeError} If input is not an array
 * @returns
 */
export const containsIdenticalValues = <V>(
  array: readonly V[] | V[],
  equality?: IsEqual<V>
): boolean => {
  // TODO: 'equality' function could be a key-generating function too

  if (!Array.isArray(array)) throw new TypeError(`Param 'array' is not an array.`);
  if (array.length === 0) return true;
  const eq = equality ?? isEqualValueDefault;
  const a = array[ 0 ];
  const r = array.some((v) => !eq(a, v));
  if (r) return false;
  return true;
};