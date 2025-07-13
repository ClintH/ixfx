import { isEqualDefault } from "./util/is-equal.js";
import { toStringDefault } from "./util/to-string.js";
//import { additionalValues } from "../iterables/sync/AdditionalValues.js";

/**
 * Combines the values of one or more arrays, removing duplicates.
 * ```js
 * const v = Arrays.uniqueDeep([ [1, 2, 3, 4], [ 3, 4, 5, 6] ]);
 * // [ 1, 2, 3, 4, 5, 6]
 * ```
 *
 * A single array can be provided as well:
 * ```js
 * const v = Arrays.uniqueDeep([ 1, 2, 3, 1, 2, 3 ]);
 * // [ 1, 2, 3 ]
 * ```
 * 
 * By default uses Javascript's default equality checking
 * 
 * See also:
 * * {@link intersection}: Overlap between two arrays
 * * {@link additionalValues}: Yield values from an iterable not present in the other
 * * {@link containsDuplicateValues}: Returns true if array contains duplicates
 * @param arrays
 * @param comparer
 * @returns
 */
export const uniqueDeep = <V>(
  arrays:
    | V[][]
    | V[]
    | readonly V[]
    | readonly (readonly V[])[],
  comparer = isEqualDefault<V>
): V[] => {
  const t: V[] = [];
  const contains = (v: V) => {
    for (const tValue of t) {
      if (comparer(tValue, v)) return true;
    }
    return false;
  }

  const flattened = arrays.flat(10) as V[];

  for (const v of flattened) {
    if (!contains(v)) t.push(v);
  }
  return t;
};

/**
 * Combines the values of one or more arrays, removing duplicates.
 * Compares based on a string representation of object. Uses a Set
 * to avoid unnecessary comparisons, perhaps faster than `uniqueDeep`.
 * 
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
    | V[][]
    | V[]
    | readonly V[]
    | readonly (readonly V[])[],
  toString = toStringDefault
): V[] => {
  const matching = new Set<string>();
  const t: V[] = [];
  const flattened = arrays.flat(10) as V[];
  for (const a of flattened) {
    const stringRepresentation = toString(a);
    if (matching.has(stringRepresentation)) continue;
    matching.add(stringRepresentation);
    t.push(a);
  }
  return t;
}