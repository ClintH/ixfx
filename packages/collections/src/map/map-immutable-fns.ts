import type { ArrayKeys, EitherKey, ObjectKeys } from '../types.js';

/**
 * Adds an array o [k,v] to the map, returning a new instance
 * @param map Initial data
 * @param data Data to add
 * @returns New map with data added
 */
const addArray = <K, V>(
  map: ReadonlyMap<K, V>,
  data: ArrayKeys<K, V>
): ReadonlyMap<K, V> => {
  const x = new Map<K, V>(map.entries());
  for (const d of data) {
    if (d[ 0 ] === undefined) throw new Error(`key cannot be undefined`);
    if (d[ 1 ] === undefined) throw new Error(`value cannot be undefined`);
    x.set(d[ 0 ], d[ 1 ]);
  }
  return x;
};

/**
 * Adds objects to the map, returning a new instance
 * @param map Initial data
 * @param data Data to add
 * @returns A new map with data added
 */
const addObjects = <K, V>(
  map: ReadonlyMap<K, V>,
  data: ObjectKeys<K, V>
): ReadonlyMap<K, V> => {
  const x = new Map<K, V>(map.entries());
  for (const d of data) {
    if (d.key === undefined) throw new Error(`key cannot be undefined`);
    if (d.value === undefined) throw new Error(`value cannot be undefined`);

    x.set(d.key, d.value);
  }
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
export const has = <K, V>(map: ReadonlyMap<K, V>, key: K): boolean =>
  map.has(key);

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
export const add = <K, V>(
  map: ReadonlyMap<K, V>,
  ...data: EitherKey<K, V>
): ReadonlyMap<K, V> => {
  if (map === undefined) throw new Error(`map parameter is undefined`);
  if (data === undefined) throw new Error(`data parameter i.s undefined`);
  if (data.length === 0) return map;

  const firstRecord = data[ 0 ];
  const isObject =
    typeof (firstRecord as { readonly key: K; readonly value: V }).key !==
    `undefined` &&
    typeof (firstRecord as { readonly key: K; readonly value: V }).value !==
    `undefined`; //(typeof (data[0] as {readonly key:K}).key !== undefined && typeof (data[0] as {readonly value:V}).value !== undefined);
  return isObject
    ? addObjects(map, data as ObjectKeys<K, V>)
    : addArray(map, data as ArrayKeys<K, V>);
};

/**
 * Sets data in a copy of the initial map
 * @param map Initial map
 * @param key Key
 * @param value Value to  set
 * @returns New map with data set
 */
export const set = <K, V>(map: ReadonlyMap<K, V>, key: K, value: V) => {
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
export const del = <K, V>(
  map: ReadonlyMap<K, V>,
  key: K
): ReadonlyMap<K, V> => {
  const x = new Map<K, V>(map.entries());
  x.delete(key);
  return x;
};
