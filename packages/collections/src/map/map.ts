import { type EitherKey } from '../types.js';
import type { IMapBase } from './imap-base.js';
import { add, del, set } from './map-immutable-fns.js';

/**
 * An immutable map. Rather than changing the map, functions like `add` and `delete`
 * return a new map reference which must be captured.
 *
 * Immutable data is useful because as it gets passed around your code, it never
 * changes from underneath you. You have what you have.
 *
 * @example
 * ```js
 * let m = map(); // Create
 * let m2 = m.set(`hello`, `samantha`);
 * // m is still empty, only m2 contains a value.
 * ```
 *
 * @typeParam K - Type of map keys. Typically `string`
 * @typeParam V - Type of stored values
 */
//eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface IMapImmutable<K, V> extends IMapBase<K, V> {
  /**
   * Adds one or more items, returning the changed map.
   *
   * Can add items in the form of `[key,value]` or `{key, value}`.
   * @example These all produce the same result
   * ```js
   * map.set(`hello`, `samantha`);
   * map.add([`hello`, `samantha`]);
   * map.add({key: `hello`, value: `samantha`})
   * ```
   * @param itemsToAdd
   */
  add(...itemsToAdd: EitherKey<K, V>): IMapImmutable<K, V>;
  /**
   * Deletes an item by key, returning the changed map
   * @param key
   */
  delete(key: K): IMapImmutable<K, V>;
  /**
   * Returns an empty map
   */
  clear(): IMapImmutable<K, V>;


  /**
   * Sets `key` to be `value`, overwriting anything existing.
   * Returns a new map with added key.
   * @param key
   * @param value
   */
  set(key: K, value: V): IMapImmutable<K, V>;

}

/**
 * Returns an {@link IMapImmutable}.
 * Use {@link Maps.mutable} as a mutable alternatve.
 *
 * @example Basic usage
 * ```js
 * // Creating
 * let m = map();
 * // Add
 * m = m.set("name", "sally");
 * // Recall
 * m.get("name");
 * ```
 *
 * @example Enumerating
 * ```js
 * for (const [key, value] of map.entries()) {
 *  console.log(`${key} = ${value}`);
 * }
 * ```
 *
 * @example Overview
 * ```js
 * // Create
 * let m = map();
 * // Add as array or key & value pair
 * m = m.add(["name" , "sally"]);
 * m = m.add({ key: "name", value: "sally" });
 * // Add using the more typical set
 * m = m.set("name", "sally");
 * m.get("name");   // "sally";
 * m.has("age");    // false
 * m.has("name");   // true
 * m.isEmpty;       // false
 * m = m.delete("name");
 * m.entries();     // Iterator of key value pairs
 * ```
 *
 * Since it is immutable, `add()`, `delete()` and `clear()` return a new version with change.
 *
 * @param dataOrMap Optional initial data in the form of an array of `{ key: value }` or `[ key, value ]`
 */
export const immutable = <K, V>(
  dataOrMap?: ReadonlyMap<K, V> | EitherKey<K, V>
): IMapImmutable<K, V> => {
  if (dataOrMap === undefined) return immutable([]);
  if (Array.isArray(dataOrMap)) return immutable<K, V>(add(new Map(), ...dataOrMap));

  const data = dataOrMap as ReadonlyMap<K, V>;
  return {
    add: (...itemsToAdd: EitherKey<K, V>) => {
      const s = add(data, ...itemsToAdd);
      return immutable(s);
    },
    set: (key: K, value: V) => {
      const s = set(data, key, value);
      return immutable(s);
    },
    get: (key: K) => data.get(key),
    delete: (key: K) => immutable(del(data, key)),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    clear: () => immutable(),
    has: (key: K) => data.has(key),
    entries: () => data.entries(),
    values: () => data.values(),
    isEmpty: () => data.size === 0,
  };
};
