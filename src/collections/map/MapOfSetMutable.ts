import { toStringDefault } from '../../util/index.js';
import { without } from '../../data/arrays/Filter.js';
import type { MapSetOpts, MultiValue } from './MapMulti.js';
import { MapOfMutableImpl } from './MapOfMultiImpl.js';
import {
  hasAnyValue as mapHasAnyValue,
  toArray as mapToArray,
  find as mapFind,
  filter as mapFilter,
  addKeepingExisting,
} from '../../data/maps/MapFns.js';
import type { IMapOfMutableExtended } from './IMapOfMutableExtended.js';

/**
 * Returns a {@link IMapOfMutableExtended} that uses a set to hold values.
 * This means that only unique values are stored under each key. By default it
 * uses the JSON representation to compare items.
 *
 * Options: `{ hash: toStringFn } }`
 *
 * `hash` is a {@link Util.ToString} function: `(object) => string`. By default it uses
 * `JSON.stringify`.
 *
 * @example Only storing the newest three items per key
 * ```js
 * const map = mapOfSetMutable();
 * map.add(`hello`, [1, 2, 3, 1, 2, 3]);
 * const hello = map.get(`hello`); // [1, 2, 3]
 * ```
 *
 * @example
 * ```js
 * const hash = (v) => v.name; // Use name as the key
 * const map = mapOfSetMutable(hash);
 * map.add(`hello`, {age:40, name: `Mary`});
 * map.add(`hello`, {age:29, name: `Mary`}); // Value ignored as same name exists
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
    add: (dest, values) => addKeepingExisting(dest, hash, ...values),
    count: (source) => source.size,
    find: (source, predicate) => mapFind(source, predicate),
    filter: (source, predicate) => mapFilter(source, predicate),
    toArray: (source) => mapToArray(source),
    has: (source, value) => mapHasAnyValue(source, value, comparer),
    without: (source, value) => without(mapToArray(source), value, comparer),
  };
  const m = new MapOfMutableImpl<V, ReadonlyMap<string, V>>(t, options);
  return m;
};
