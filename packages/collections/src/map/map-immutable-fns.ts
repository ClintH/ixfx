import type { ArrayKeys, EitherKey, ObjectKeys } from '../types.js';

/**
 * Sets an array of [k,v] into `target`, mutating it
 * @param target Map to change
 * @param data Data to add
 */
function setArray<K, V>(target: Map<K, V>, data: ArrayKeys<K, V>): void {
  for (const d of data) {
    if (d[0] === undefined)
      throw new Error(`key cannot be undefined`);
    if (d[1] === undefined)
      throw new Error(`value cannot be undefined`);
    target.set(d[0], d[1]);
  }
}

/**
 * Sets objects of {key,value} into `target`, mutating it
 * @param target Map to change
 * @param data Data to add
 */
function setObjects<K, V>(target: Map<K, V>, data: ObjectKeys<K, V>): void {
  for (const d of data) {
    if (d.key === undefined)
      throw new Error(`key cannot be undefined`);
    if (d.value === undefined)
      throw new Error(`value cannot be undefined`);
    target.set(d.key, d.value);
  }
}

/**
 * Adds data to `target` in place, in the form of [key,value] or {key, value}.
 * @param target Map to change
 * @param data Data to add
 */
export function addInPlace<K, V>(target: Map<K, V>, ...data: EitherKey<K, V>): void {
  if (data.length === 0)
    return;
  const firstRecord = data[0] as { readonly key: K; readonly value: V };
  const isObject = typeof firstRecord.key !== `undefined` && typeof firstRecord.value !== `undefined`;
  if (isObject)
    setObjects(target, data as ObjectKeys<K, V>);
  else setArray(target, data as ArrayKeys<K, V>);
}

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
export function has<K, V>(map: ReadonlyMap<K, V>, key: K): boolean {
  return map.has(key);
}

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
export function add<K, V>(map: ReadonlyMap<K, V>, ...data: EitherKey<K, V>): ReadonlyMap<K, V> {
  if (map === undefined)
    throw new Error(`map parameter is undefined`);
  if (data === undefined)
    throw new Error(`data parameter i.s undefined`);
  if (data.length === 0)
    return map;
  const x = new Map<K, V>(map);
  addInPlace(x, ...data);
  return x;
}

/**
 * Sets data in a copy of the initial map.
 * If `key` already holds `value` (compared with `Object.is`), `map` is returned as-is.
 * @param map Initial map
 * @param key Key
 * @param value Value to  set
 * @returns New map with data set, or `map` if nothing changed
 */
export function set<K, V>(map: ReadonlyMap<K, V>, key: K, value: V): ReadonlyMap<K, V> {
  if (map.has(key) && Object.is(map.get(key), value))
    return map;
  const x = new Map<K, V>(map);
  x.set(key, value);
  return x;
}

/**
 * Delete a key from the map, returning a new map.
 * If `key` is not present, `map` is returned as-is.
 * @param map Initial data
 * @param key
 * @returns New map with data deleted, or `map` if nothing changed
 */
export function del<K, V>(map: ReadonlyMap<K, V>, key: K): ReadonlyMap<K, V> {
  if (!map.has(key))
    return map;
  const x = new Map<K, V>(map);
  x.delete(key);
  return x;
}
