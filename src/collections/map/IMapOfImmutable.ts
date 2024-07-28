import type { IMapOf } from './IMapOf.js';

/**
 * Like a `Map` but multiple values can be stored for each key. Immutable.
 * Duplicate values can be added to the same or even a several keys.
 *
 * Adding
 * ```js
 * // Add one or more values using the predefined key function to generate a key
 * map = map.addValue(value1, value2, ...);
 * // Add one or more values under a specified key
 * map = map.addKeyedValues(key, value1, value2, ...);
 * ```
 *
 * Finding/accessing
 * ```js
 * // Returns all values stored under key
 * map.get(key);
 * // Returns the first key where value is found, or _undefined_ if not found
 * map.findKeyForValue(value);
 * // Returns _true_  if value is stored under key
 * map.hasKeyValue(key, value);
 * // Returns _true_ if map contains key
 * map.has(key);
 * ```
 *
 * Removing
 * ```js
 * // Removes everything
 * map = map.clear();
 * // Delete values under key. Returns _true_ if key was found.
 * map = map.delete(key);
 * // Deletes specified value under key. Returns _true_ if found.
 * map = map.deleteKeyValue(key, value);
 * ```
 *
 * Metadata about the map:
 * ```js
 * map.isEmpty;         // True/false
 * map.lengthMax;       // Largest count of items under any key
 * map.count(key);      // Count of items stored under key, or 0 if key is not present.
 * map.keys();          // Returns a string array of keys
 * map.keysAndCounts(); // Returns an array of [string,number] for all keys and number of values for each key
 * map.debugString();   // Returns a human-readable string dump of the contents
 * ```
 *
 * @typeParam V - Values stored under keys
 * @typeParam M - Type of data structure managing values
 */
export interface IMapOfImmutable<V> extends IMapOf<V> {
  /**
   * Adds several `values` under the same `key`. Duplicate values are permitted, depending on implementation.
   * @param key
   * @param values
   */
  addKeyedValues(key: string, ...values: ReadonlyArray<V>): IMapOfImmutable<V>;

  /**
   * Adds a value, automatically extracting a key via the
   * `groupBy` function assigned in the constructor options.
   * @param values Adds several values
   */
  addValue(...values: ReadonlyArray<V>): IMapOfImmutable<V>;
  /**
   * Clears the map
   */
  clear(): IMapOfImmutable<V>;

  /**
   * Deletes all values under `key` that match `value`.
   * @param key Key
   * @param value Value
   */
  deleteKeyValue(key: string, value: V): IMapOfImmutable<V>;

  /**
   * Delete all occurrences of `value`, regardless of
   * key it is stored under.
   * @param value
   */
  deleteByValue(value: V): IMapOfImmutable<V>;

  /**
   * Deletes all values stored under `key`.
   * @param key
   */
  delete(key: string): IMapOfImmutable<V>;
}
