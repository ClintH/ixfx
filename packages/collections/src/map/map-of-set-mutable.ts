import { toStringDefault } from '@ixfx/core';
import { without } from '@ixfx/arrays';
import type { MapSetOpts, MultiValue } from './map-multi.js';
import { MapOfMutableImpl } from './map-of-multi-impl.js';
import {
  hasAnyValue as mapHasAnyValue,
  toArray as mapToArray,
  findValue as mapFindValue,
  filterValues as mapFilterValues,
  addValue as mapAddValue
} from '@ixfx/core/maps';
import type { IMapOfMutableExtended } from './imap-of-mutable-extended.js';

/**
 * Returns a {@link IMapOfMutableExtended} that uses a set to hold values.
 * This means that only unique values are stored under each key. By default it
 * uses the JSON representation to compare items.
 *
 * Options: `{ hash: toStringFn } }`
 *
 * `hash` is Util.ToString function: `(object) => string`. By default it uses
 * `JSON.stringify`.
 *
 * @example Only storing the newest three items per key
 * ```js
 * const map = ofSetMutable();
 * map.addKeyedValues(`hello`, [1, 2, 3, 1, 2, 3]);
 * const hello = map.get(`hello`); // [1, 2, 3]
 * ```
 *
 * @example
 * ```js
 * const hash = (v) => v.name; // Use name as the key
 * const map = ofSetMutable({hash});
 * map.addValue({age:40, name: `Mary`});
 * map.addValue({age:29, name: `Mary`}); // Value ignored as same name exists
 * ```
 * @param options
 * @returns
 */
export const ofSetMutable = <V>(
  options?: MapSetOpts<V>
): IMapOfMutableExtended<V, ReadonlyMap<string, V>> => {
  const hash = options?.hash ?? toStringDefault;
  const comparer = (a: V, b: V) => hash(a) === hash(b);

  const t: MultiValue<V, ReadonlyMap<string, V>> = {
    get name() {
      return `set`;
    },
    iterable: (source) => source.values(),
    addKeyedValues: (dest, values) => mapAddValue(dest, hash, `skip`, ...values),
    count: (source) => source.size,
    find: (source, predicate) => mapFindValue(source, predicate),
    filter: (source, predicate) => mapFilterValues(source, predicate),
    toArrayCopy: (source) => mapToArray(source),
    has: (source, value) => mapHasAnyValue(source, value, comparer),
    without: (source, value) => without(mapToArray(source), value, comparer),
  };
  const m = new MapOfMutableImpl<V, ReadonlyMap<string, V>>(t, options);
  return m;
};
