import { type IsEqual } from "./util/is-equal.js";
import { toStringDefault } from "./util/to-string.js";

/**
 * Combines the values of one or more arrays, removing duplicates.
 * 
 * ```js
 * const eq = (a, b) => {
 *  return a.name === b.name
 * }
 * const v = Arrays.unique([ 
 *  [ {name:'jane'}, {name:'billy'}, {name:'thom'} ], 
 *  [ {name:'molly'}, {name:'jane'}, {name:'sally'}, {name:'thom'}] 
 * ], eq);
 * // [ {name:'jane'}, {name:'billy'}, {name:'thom'}, {name:'molly'}, , {name:'sally'} ]
 * ```
 *
 * A single array can be provided as well:
 * 
 * ```js
 * const v = Arrays.unique([ 
 *  {name:'jane'}, {name:'billy'}, {name:'thom'}, {name:'billy'},
 * ], eq);
 * // [ {name:'jane'}, {name:'billy'}, {name:'thom'} ]
 * ```
 * 
 * See also:
 * * {@link intersection}: Get overlap between two arrays
 * * Iterables.additionalValues: Yield values from an iterable not present in the other
 * * {@link containsDuplicateValues}: Returns true if array contains duplicates
 * @param arrays
 * @param comparer
 * @returns
 */
export function unique<V>(
  arrays:
    | V[][]
    | V[]
    | readonly V[]
    | readonly (readonly V[])[],
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  comparer: IsEqual<V>
): V[];

/**
 * Combines the values of one or more arrays, removing duplicates.
 * 
 * Compares based on a string representation of object. Uses a Set
 * to avoid unnecessary comparisons, perhaps faster than using a comparer function.
 * 
 * ```js
 * const str = (v) => JSON.stringify(v);
 * const v = Arrays.unique([ 
 *  [ {name:'jane'}, {name:'billy'}, {name:'thom'} ], 
 *  [ {name:'molly'}, {name:'jane'}, {name:'sally'}, {name:'thom'}] 
 * ], str);
 * // [ {name:'jane'}, {name:'billy'}, {name:'thom'}, {name:'molly'}, , {name:'sally'} ]
 * ```
 *
 * A single array can be provided as well:
 * 
 * ```js
 * const v = Arrays.unique([ 
 *  {name:'jane'}, {name:'billy'}, {name:'thom'}, {name:'billy'},
 * ], eq);
 * // [ {name:'jane'}, {name:'billy'}, {name:'thom'} ]
 * ```
 * 
 * By default uses JSON.toString() to compare values.
 * 
 * See also:
 * * {@link intersection}: Overlap between two arrays
 * * Iterables.additionalValues: Yield values from an iterable not present in the other
 * * {@link containsDuplicateValues}: Returns true if array contains duplicates
 * @param arrays Array (or array of arrays) to examine
 * @param toString Function to convert values to a string for comparison purposes. By default uses JSON formatting.
 * @returns
 */
export function unique<V>(
  arrays:
    | V[][]
    | V[]
    | readonly V[]
    | readonly (readonly V[])[],
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  toString: (item: V) => string
): V[];

/**
 * Combines the values of one or more arrays, removing duplicates.
 * 
 * By default compares values based on a JSON string representation.
 * 
 * @param arrays Array (or array of arrays) to examine
 * @param toString Function to convert values to a string for comparison purposes. By default uses JSON formatting.
 * @returns
 */
export function unique<V>(
  arrays:
    | V[][]
    | V[]
    | readonly V[]
    | readonly (readonly V[])[]
): V[];

/**
 * Combines the values of one or more arrays, removing duplicates.
 * 
 * By default compares values based on a JSON string representation.
 * 
 * @param arrays Array (or array of arrays) to examine
 * @param toString Function to convert values to a string for comparison purposes. By default uses JSON formatting.
 * @returns
 */
export function unique<V>(
  arrays:
    | V[][]
    | V[]
    | readonly V[]
    | readonly (readonly V[])[],
  comparer?: IsEqual<V> | ((item: V) => string)
): V[] {
  const flattened = arrays.flat(10) as V[];
  if (flattened.length <= 1) return flattened;

  comparer ??= toStringDefault;

  // Test function to see if it's key-producing or not
  const r = comparer(flattened[ 0 ], flattened[ 1 ]);

  // Use corresponding function
  if (typeof r === `string`)
    return uniqueByKeyImpl(flattened, comparer as (item: V) => string);
  else
    return uniqueByComparerImpl(flattened, comparer as IsEqual<V>);
};

const uniqueByKeyImpl = <V>(flattened: V[], toString: (item: V) => string) => {
  const matching = new Set<string>();
  const t: V[] = [];
  for (const a of flattened) {
    const stringRepresentation = toString(a);
    if (matching.has(stringRepresentation)) continue;
    matching.add(stringRepresentation);
    t.push(a);
  }
  return t;
}

const uniqueByComparerImpl = <V>(flattened: V[], comparer: (a: V, b: V) => boolean): V[] => {
  const t: V[] = [];
  const contains = (v: V) => {
    for (const tValue of t) {
      if (comparer(tValue, v)) return true;
    }
    return false;
  }

  for (const v of flattened) {
    if (!contains(v)) t.push(v);
  }
  return t;
}