// ✔ UNIT TESTED

import { type IsEqual, isEqualDefault } from '@ixfx/core';
import type { IWithEntries } from '@ixfx/core';
import { isEqualIgnoreOrder as arraysIsEqualIgnoreOrder } from '@ixfx/arrays';
import { equals as iterablesEquals } from '@ixfx/iterables/sync';

/**
 * Finds first entry by iterable value. Expects a map with an iterable as values.
 *
 * ```js
 * const map = new Map();
 * map.set('hello', ['a', 'b', 'c']);
 * map.set('there', ['d', 'e', 'f']);
 *
 * const entry = firstEntry(map, (value, key) => {
 *  return (value === 'e');
 * });
 * // Entry is: ['there', ['d', 'e', 'f']]
 * ```
 *
 * An alternative is {@link firstEntryByValue} to search by value.
 * @param map Map to search
 * @param predicate Filter function returns true when there is a match of value
 * @returns Entry, or _undefined_ if `filter` function never returns _true_
 */
export const firstEntry = <K, V>(
  map: IWithEntries<K, Iterable<V>>,
  predicate: (value: V, key: K) => boolean
): readonly [ key: K, value: Iterable<V> ] | undefined => {
  for (const entry of map.entries()) {
    const value = entry[ 1 ];
    for (const subValue of value) {
      if (predicate(subValue, entry[ 0 ])) return entry;
    }
  }
};

/**
 * Returns the entry with the largest count of elements,
 * or _undefined_ if `map` is empty.
 */
export const longestEntry = <K, V extends { length: number }>(map: IWithEntries<K, V>): readonly [ K, V ] | undefined => {
  if (typeof map !== `object`) throw new TypeError(`Param 'map' is not an object. Got: ${ typeof map }`);
  if (!(`entries` in map)) throw new TypeError(`Param 'map' does not have 'entries' function`);

  //export const lengthMax = <V>(map: IMapOf<V>): number => {
  //let largest: readonly [ string, number ] = [ '', 0 ];
  let largestEntry: readonly [ K, V ] | undefined;
  const largest = Number.MIN_SAFE_INTEGER;

  for (const entry of map.entries()) {
    const v = entry[ 1 ];
    if (typeof v !== `object`) throw new TypeError(`All items in map are expected to be an object type. Got: ${ typeof v }`);
    if (!(`length` in v)) throw new TypeError(`All items in map must have a 'length' field`);
    if (v.length > largest) {
      largestEntry = entry;
    }
    // if (e[ 1 ] > largest[ 1 ]) {
    //   largest = e;
    // }
  }
  return largestEntry;
};


/**
 * Finds first entry by iterable value. Expects a map with an iterable as values.
 *
 * ```js
 * const map = new Map();
 * map.set('hello', ['a', 'b', 'c']);
 * map.set('there', ['d', 'e', 'f']);
 *
 * const entry = firstEntryByValue(map, 'e');
 * // Entry is: ['there', ['d', 'e', 'f']]
 * ```
 *
 * An alternative is {@link firstEntry} to search by predicate function.
 * @param map Map to search
 * @param soughtValue Value to seek
 * @param isEqual Filter function which checks equality. Uses JS comparer by default.
 * @returns Entry, or _undefined_ if `value` not found.
 * @throws If 'map' doesn't seem like a map
 */
export const firstEntryByValue = <K, V>(
  map: IWithEntries<K, Iterable<V>>,
  soughtValue: V,
  isEqual: IsEqual<V> = isEqualDefault
): readonly [ key: K, value: Iterable<V> ] | undefined => {
  if (typeof map !== `object`) throw new TypeError(`Param 'map' is expected to be an object. Got: ${ typeof map }`);
  if (!(`entries` in map)) throw new TypeError(`Param 'map' is expected to have 'entries()'`);
  for (const entry of map.entries()) {
    const entryValue = entry[ 1 ];
    for (const subValue of entryValue) {
      if (isEqual(subValue, soughtValue)) return entry;
    }
  }
};

/**
 * Returns a copy of `map`, with the internal arrays being a different object.
 * Values contained inside are not copied.
 * @param map 
 * @returns 
 */
export const cloneShallow = <K, V>(map: IWithEntries<K, Iterable<V>>) => {
  const entries = [ ...map.entries() ];
  const copied: [ K, V[] ][] = entries.map((entry) => [ entry[ 0 ], [ ...entry[ 1 ] ] ])

  return new Map<K, V[]>(copied);
}

/**
 * Returns true if both sets of data have the same keys, and iterables at each key contain the same values, regardless of order.
 * By default uses === comparison semantics.
 * @param a 
 * @param b 
 * @param eq 
 * @returns 
 */
export const equals = <K, V>(
  a: IWithEntries<K, Iterable<V>>,
  b: IWithEntries<K, Iterable<V>>,
  comparerOrKey: IsEqual<V> | ((v: V) => string) = isEqualDefault<V>) => {
  const aa = [ ...a.entries() ]
  const bb = [ ...b.entries() ]
  if (aa.length !== bb.length) return false;

  for (const ae of aa) {
    // Find entry for this key
    const be = bb.find(v => v[ 0 ] === ae[ 0 ]);
    if (!be) return false; // Key in A doesn't exist in B

    const aValues = Array.from(ae[ 1 ]);
    const bValues = Array.from(be[ 1 ]);

    if (!arraysIsEqualIgnoreOrder(aValues, bValues, comparerOrKey)) return false;
  }
  return true;
}