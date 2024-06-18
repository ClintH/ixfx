import { type EitherKey } from '../Types.js';
import type { IMapBase } from './IMapBase.js';
import { add, del, set, has } from './MapImmutableFns.js';

/**
 * A mutable map.
 *
 * It is a wrapper around the in-built Map type, but adds roughly the same API as {@link IMapImmutable}.
 *
 * @template K Type of map keys. Typically `string`
 * @template V Type of stored values
 */
//eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface IMapMutable<K, V> extends IMapBase<K, V> {
  /**
   * Adds one or more items to map
   *
   * Can add items in the form of [key,value] or `{key, value}`.
   * @example These all produce the same result
   * ```js
   * map.set(`hello`, `samantha`);
   * map.add([`hello`, `samantha`]);
   * map.add({key: `hello`, value: `samantha`})
   * ```
   * @param itemsToAdd
   * @param itemsToAdd
   */
  add(...itemsToAdd: EitherKey<K, V>): void;
  /**
   * Sets a value to a specified key
   * @param key
   * @param value
   */
  set(key: K, value: V): void;
  /**
   * Deletes an item by key
   * @param key
   */
  delete(key: K): void;
  /**
   * Clears map
   */
  clear(): void;
}

/**
 * Returns a {@link IMapMutable} (which just wraps the in-built Map)
 * Use {@link Maps.immutable} for the immutable alternative.
 *
 * @example Basic usage
 * ```js
 * const m = mapMutable();
 * // Add one or more entries
 * m.add(["name", "sally"]);
 * // Alternatively:
 * m.set("name", "sally");
 * // Recall
 * m.get("name");           // "sally"
 * m.delete("name");
 * m.isEmpty; // True
 * m.clear();
 * ```
 * @param data Optional initial data in the form of an array of `{ key: value }` or `[ key, value ]`
 */
export const mutable = <K, V>(...data: EitherKey<K, V>): IMapMutable<K, V> => {
  // eslint-disable-next-line functional/no-let
  let m = add(new Map<K, V>(), ...data);
  return {
    add: (...data: EitherKey<K, V>) => {
      m = add(m, ...data);
    },
    delete: (key: K) => {
      m = del(m, key);
    },
    clear: () => {
      m = add(new Map<K, V>());
    },
    set: (key: K, value: V): void => {
      m = set(m, key, value);
    },
    get: (key: K): V | undefined => m.get(key),
    entries: () => m.entries(),
    values: () => m.values(),
    isEmpty: () => m.size === 0,
    has: (key: K) => has(m, key),
  };
};
