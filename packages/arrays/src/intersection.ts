import { type IsEqual } from "./util/is-equal.js";
import { toStringDefault } from "./util/to-string.js";

/**
 * Returns the _intersection_ of two arrays: the elements that are in common. Duplicates are removed in the process.
 * 
 * Custom function checks equality of objects:
 * ```js
 * // Compare based on 'name' property
 * intersection(arrayA, arrayB, (a,b) => {
 *  return a.name === b.name
 * })
 * ```
 * @param arrayA 
 * @param arrayB 
 * @param comparer 
 */
export function intersection<V>(
  arrayA: V[], arrayB: V[],
  comparer: IsEqual<V>
): V[];

/**
 * Returns the _intersection_ of two arrays: the elements that are in common. Duplicates are removed in the process.
 * 
 * Custom function makes a string representation of objects to use as the basis for comparison
 * ```js
 * intersection(arrayA, arrayB, (v) => v.name)
 * ```
 * @param arrayA 
 * @param arrayB 
 * @param toString 
 */
export function intersection<V>(
  arrayA: V[], arrayB: V[],
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  toString: (value: V) => string
): V[];

export function intersection<V>(
  arrayA: V[], arrayB: V[],

  comparerOrKey?: IsEqual<V> | ((value: V) => string)
): V[];

/**
 * Returns the _intersection_ of two arrays: the elements that are in common. Duplicates are removed in the process.
 * 
 * By default compares based on a string representation of object.
 * 
 * ```js
 * intersection([1, 2, 3], [2, 4, 6]); // returns [2]
 * ```
 * 
 * To compare object instances:
 * ```js
 * intersection(arrayA, arrayB, (a,b) => a === b)
 * ```
 * 
 * To use a custom string representation, eg, to only compare based on 'name' property of objects:
 * ```js
 * intersection(arrayA, arrayB, (v) => v.name)
 * ```
 * 
 * See also: 
 * * {@link uniqueByKey}/{@link uniqueByComparer}: Get unique items across one or more arrays, including within the array
 * @param arrayA 
 * @param arrayB 
 * @param comparerOrKey Comparer or key-generating function 
 * @returns 
 */
export function intersection<V>(
  arrayA: V[],
  arrayB: V[],
  comparerOrKey?: IsEqual<V> | ((value: V) => string)
) {
  if (arrayA.length === 0) return arrayB;
  if (arrayB.length === 0) return arrayA;

  comparerOrKey ??= toStringDefault;
  // Test function to see if it's key-producing or not
  const r = comparerOrKey(arrayA[ 0 ], arrayB[ 0 ]);

  if (typeof r === `string`) {
    // Default
    return intersectionByKeyImpl(arrayA, arrayB, comparerOrKey as (item: V) => string);
  } else {
    return intersectionByComparerImpl(arrayA, arrayB, comparerOrKey as IsEqual<V>)
  }
}

const intersectionByComparerImpl = <V>(arrayA: V[], arrayB: V[], equality: IsEqual<V>): V[] => {
  return arrayA.filter((valueFromA) => arrayB.some((valueFromB) => equality(valueFromA, valueFromB)));
}

const intersectionByKeyImpl = <V>(arrayA: V[], arrayB: V[], key: (value: V) => string) => {
  const aKeys = new Set<string>();
  const result: V[] = [];
  for (const v of arrayA) {
    aKeys.add(key(v));
  }
  const bUsed = new Set<string>()
  for (const v of arrayB) {
    const bKey = key(v);
    if (bUsed.has(bKey)) continue;
    if (aKeys.has(bKey)) {
      result.push(v);
      bUsed.add(bKey);
    }
  }
  return result;
}