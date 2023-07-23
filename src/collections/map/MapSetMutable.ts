import { toStringDefault } from '../../Util.js';
import { without } from '../Arrays';
import type { MapSetOpts, MultiValue } from './MapMulti';
import { MapOfMutableImpl } from './MapOfMultiImpl';
import {
  hasAnyValue as mapHasAnyValue,
  toArray as mapToArray,
  find as mapFind,
  filter as mapFilter,
  addKeepingExisting,
} from './MapFns.js';
import type { IMapOfMutableExtended } from './IMapOfMutableExtended';

/**
 * Returns a {@link MapOfMutable} that uses a set to hold values.
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
 * const map = mapSetMutable();
 * map.add(`hello`, [1, 2, 3, 1, 2, 3]);
 * const hello = map.get(`hello`); // [1, 2, 3]
 * ```
 *
 * @example
 * ```js
 * const hash = (v) => v.name; // Use name as the key
 * const map = mapSetMutable(hash);
 * map.add(`hello`, {age:40, name: `Mary`});
 * map.add(`hello`, {age:29, name: `Mary`}); // Value ignored as same name exists
 * ```
 * @param opts
 * @returns
 */
export const mapSetMutable = <V>(
  opts?: MapSetOpts<V>
): IMapOfMutableExtended<V, ReadonlyMap<string, V>> => {
  const hash = opts?.hash ?? toStringDefault;
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
  const m = new MapOfMutableImpl<V, ReadonlyMap<string, V>>(t, opts);
  return m;
};
