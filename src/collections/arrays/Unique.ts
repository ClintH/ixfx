import { isEqualDefault } from "../../util/IsEqual.js";
import { additionalValues } from "./AdditionalValues.js";

/**
 * Combines the values of one or more arrays, removing duplicates
 * ```js
 * const v = Arrays.unique([ [1, 2, 3, 4], [ 3, 4, 5, 6] ]);
 * // [ 1, 2, 3, 4, 5, 6]
 * ```
 *
 * A single array can be provided as well:
 * ```js
 * const v = Arrays.unique([ 1, 2, 3, 1, 2, 3 ]);
 * // [ 1, 2, 3 ]
 * ```
 * 
 * By default uses JSON.toString() to compare values.
 * 
 * See also:
 * * {@link intersection}: Overlap between two arrays
 * * {@link additionalValues}: Yield values from an iterable not present in the other
 * * {@link containsDuplicateValues}: Returns true if array contains duplicates
 * @param arrays
 * @param comparer
 * @returns
 */
export const unique = <V>(
  arrays:
    | Array<Array<V>>
    | Array<V>
    | ReadonlyArray<V>
    | ReadonlyArray<ReadonlyArray<V>>,
  comparer = isEqualDefault<V>
): ReadonlyArray<V> => {
  const t: Array<V> = [];
  for (const a of arrays) {
    if (Array.isArray(a)) {
      for (const v of additionalValues<V>(t, a, comparer)) {
        t.push(v);
      }
    } else {
      return [ ...additionalValues<V>([], arrays as Array<V>, comparer) ];
    }
  }
  return t;
};

