
import {ArrayKeys, EitherKey, ObjKeys, MapImmutable } from "./Interfaces";

/**
 * Adds an array o [k,v] to the map, returning a new instance
 * @param map Initial data
 * @param data Data to add
 * @returns New map with data added
 */
const addArray = <K, V>(map: ReadonlyMap<K, V>, data:ArrayKeys<K, V>): ReadonlyMap<K, V> => {
  const x = new Map<K, V>(map.entries());
  data.forEach(d => {
    if (d[0] === undefined) throw new Error(`key cannot be undefined`);
    if (d[1] === undefined) throw new Error(`value cannot be undefined`);
    x.set(d[0], d[1]);
  });
  return x;
};

/**
 * Adds objects to the map, returning a new instance
 * @param map Initial data
 * @param data Data to add
 * @returns A new map with data added
 */
const addObjects = <K, V>(map: ReadonlyMap<K, V>, data:ObjKeys<K, V>): ReadonlyMap<K, V> => {
  const x = new Map<K, V>(map.entries());
  data.forEach(d => {
    if (d.key === undefined) throw new Error(`key cannot be undefined`);
    if (d.value === undefined) throw new Error(`value cannot be undefined`);

    x.set(d.key, d.value);
  });
  return x;
};

/**
 * Returns true if map contains key
 * 
 * @example
 * ```js
 * if (has(map, `London`)) ...
 * ```
 * @param map Map to search
 * @param key Key to find
 * @returns True if map contains key
 */
export const has = <K, V>(map: ReadonlyMap<K, V>, key: K): boolean => map.has(key);

/**
 * Adds data to a map, returning the new map.
 * 
 * Can add items in the form of [key,value] or {key, value}.
 * @example These all produce the same result
 * ```js
 * map.set(`hello`, `samantha`);
 * map.add([`hello`, `samantha`]);
 * map.add({key: `hello`, value: `samantha`})
 * ```
 * @param map Initial data
 * @param data One or more data to add in the form of [key,value] or {key, value} 
 * @returns New map with data added
 */
export const add = <K, V>(map: ReadonlyMap<K, V>, ...data:EitherKey<K, V>): ReadonlyMap<K, V> => {
  if (map === undefined) throw new Error(`map parameter is undefined`);
  if (data === undefined) throw new Error(`data parameter i.s undefined`);
  if (data.length === 0) return map;

  const firstRecord = data[0];
  const isObj = typeof (firstRecord as {readonly key:K, readonly value:V}).key !== `undefined` && typeof (firstRecord as {readonly key:K, readonly value:V}).value !== `undefined`;  //(typeof (data[0] as {readonly key:K}).key !== undefined && typeof (data[0] as {readonly value:V}).value !== undefined);
  return isObj ? addObjects(map, data as ObjKeys<K, V>) : addArray(map, data as ArrayKeys<K, V>);
};

/**
 * Sets data in a copy of the initial map
 * @param map Initial map
 * @param key Key
 * @param value Value to  set
 * @returns New map with data set
 */
export const set = <K, V>(map: ReadonlyMap<K, V>, key:K, value:V) => {
  const x = new Map<K, V>(map.entries());
  x.set(key, value);
  return x;
};

/**
 * Delete a key from the map, returning a new map
 * @param map Initial data
 * @param key 
 * @returns New map with data deleted
 */
export const del = <K, V>(map: ReadonlyMap<K, V>, key: K): ReadonlyMap<K, V> => {
  const x = new Map<K, V>(map.entries());
  x.delete(key);
  return x;
};

/**
 * Returns an {@link MapImmutable}.
 * Use {@link mapMutable} as a mutable alternatve.
 * 
 * @example Basic usage
 * ```js
 * // Creating
 * let m = map();
 * // Add
 * m = m.add(["name", "sally"]);
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
 * // Add
 * m = m.add(["name" , "sally"]);
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
export const map = <K, V>(dataOrMap?: ReadonlyMap<K, V>|EitherKey<K, V>):MapImmutable<K, V> => {
  if (dataOrMap === undefined) return map([]);
  if (Array.isArray(dataOrMap)) return map(add(new Map(), ...dataOrMap));
  const data = dataOrMap as ReadonlyMap<K, V>;
  return {
    add: (...itemsToAdd:EitherKey<K, V>) => {
      const s = add(data, ...itemsToAdd);
      return map(s);
    },
    get: (key:K) => data.get(key),
    delete: (key:K) => map(del(data, key)),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    clear: () => map(),
    has: (key:K) => data.has(key),
    entries: () => data.entries(),
    isEmpty: () => data.size === 0
  };
};