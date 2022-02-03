/* eslint-disable */
export type ArrayKeys<K, V> = ReadonlyArray<readonly [key:K, value:V]>;
export type ObjKeys<K, V> = ReadonlyArray<{readonly key: K, readonly value: V}>;
export type EitherKey<K, V> = ArrayKeys<K, V> | ObjKeys<K, V>;

/**
 * An immutable map. Rather than changing the map, functions like `add` and `delete` 
 * return a new map reference which must be captured.
 * 
 * Immutable data is useful because as it gets passed around your code, it never
 * changes from underneath you. You have what you have.
 * 
 * @example
 * ```js
 * let m = map();
 * let m2 = m.set(`hello`, `samantha`);
 * // m is still empty, only m2 contains a value.
 * ```
 */
export interface ImmutableMap<K, V> {
  /**
   * Adds one or more items, returning the changed map.
   * 
   * Can add items in the form of [key,value] or {key, value}.
   * @example These all produce the same result
   * ```js
   * map.set(`hello`, `samantha`);
   * map.add([`hello`, `samantha`]);
   * map.add({key: `hello`, value: `samantha`})
   * ```
   * @param itemsToAdd 
   */
  add(...itemsToAdd: EitherKey<K, V>): ImmutableMap<K, V>
  /**
   * Deletes an item by key, returning the changed map
   * @param key 
   */
  delete(key: K): ImmutableMap<K, V>
  /**
   * Returns an empty map
   */
  clear(): ImmutableMap<K, V>
  /**
   * Returns an item by key, or undefined if not found
   * @param key 
   */
  get(key: K): V | undefined
  /**
   * Returns true if map contains `key`
   * @param key
   */
  has(key: K): boolean
  /**
   * Returns true if map is empty
   */
  isEmpty(): boolean
  /**
   * Iterates over entries (in the form of [key,value])
   */
  entries(): IterableIterator<readonly [K, V]>
}

/**
 * A mutable map.
 * 
 * It is a wrapper around the in-built Map type, but adds roughly the same API as {@link ImmutableMap}.
 */
export interface MutableMap<K, V> {
  /**
   * Adds one or more items to map
   * 
   * Can add items in the form of [key,value] or {key, value}.
   * @example These all produce the same result
   * ```js
   * map.set(`hello`, `samantha`);
   * map.add([`hello`, `samantha`]);
   * map.add({key: `hello`, value: `samantha`})
   * ```
   * @param itemsToAdd 
   * @param itemsToAdd 
   */
  add(...itemsToAdd: EitherKey<K, V>): void
  /**
   * Sets a value to a specified key
   * @param key 
   * @param value 
   */
  set(key: K, value: V): void
  /**
   * Deletes an item by key
   * @param key 
   */
  delete(key: K): void
  /**
   * Clears map
   */
  clear(): void
  /**
   * Gets an item by key
   * @param key
   */
  get(key: K): V | undefined
  /**
   * Returns true if map contains key
   * @param key 
   */
  has(key: K): boolean
  /**
   * Returns true if map is empty
   */
  isEmpty(): boolean
  /**
   * Iterates over entries (consisting of [key,value])
   */
  entries(): IterableIterator<readonly [K, V]>
}