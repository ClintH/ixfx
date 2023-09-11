// ✔ UNIT TESTED

import { type IsEqual, isEqualDefault } from '../../IsEqual.js';
import type { IMapOf } from './IMapOf.js';
import type { IWithEntries } from './IMappish.js';

/**
 * Finds first entry by iterable value. Expects a map with an iterable as values.
 *
 * ```js
 * const map = new Map();
 * map.set('hello', ['a', 'b', 'c']);
 * map.set('there', ['d', 'e', 'f']);
 *
 * const entry = firstEntryByIterablePredicate(map, (value, key) => {
 *  return (value === 'e');
 * });
 * // Entry is: ['there', ['d', 'e', 'f']]
 * ```
 *
 * An alternative is {@link firstEntryByIterableValue} to search by value.
 * @param map Map to search
 * @param predicate Filter function returns true when there is a match of value
 * @returns Entry, or _undefined_ if `filter` function never returns _true_
 */
export const firstEntryByIterablePredicate = <K, V>(
  map: IWithEntries<K, Iterable<V>>,
  predicate: (value: V, key: K) => boolean
): readonly [ key: K, value: Iterable<V> ] | undefined => {
  for (const e of map.entries()) {
    const val = e[ 1 ];
    for (const subValue of val) {
      if (predicate(subValue, e[ 0 ])) return e;
    }
  }
};

/**
 * Returns the size of the largest key, or 0 if empty.
 */
export const lengthMax = <V>(map: IMapOf<V>): number => {
  //eslint-disable-next-line functional/no-let
  let largest: readonly [ string, number ] = [ '', 0 ];
  for (const e of map.keysAndCounts()) {
    if (e[ 1 ] > largest[ 1 ]) {
      largest = e;
    }
  }
  return largest[ 1 ];
};

/**
 * Finds first entry by iterable value. Expects a map with an iterable as values.
 *
 * ```js
 * const map = new Map();
 * map.set('hello', ['a', 'b', 'c']);
 * map.set('there', ['d', 'e', 'f']);
 *
 * const entry = firstEntryByIterableValue(map, 'e');
 * // Entry is: ['there', ['d', 'e', 'f']]
 * ```
 *
 * An alternative is {@link firstEntryByIterablePredicate} to search by predicate function.
 * @param map Map to search
 * @param value Value to seek
 * @param isEqual Filter function which checks equality. Uses JS comparer by default.
 * @returns Entry, or _undefined_ if `value` not found.
 */
export const firstEntryByIterableValue = <K, V>(
  map: IWithEntries<K, Iterable<V>>,
  value: V,
  isEqual: IsEqual<V> = isEqualDefault
): readonly [ key: K, value: Iterable<V> ] | undefined => {
  for (const e of map.entries()) {
    const val = e[ 1 ];
    for (const subValue of val) {
      if (isEqual(subValue, value)) return e;
    }
  }
};
