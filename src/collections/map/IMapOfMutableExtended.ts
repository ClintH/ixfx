import { SimpleEventEmitter } from '../../Events.js';
import type { IMapOfMutable } from './IMapOfMutable.js';

/**
 * Events from mapArray
 */
export type MapArrayEvents<V> = {
  readonly addedValues: { readonly values: ReadonlyArray<V> };
  readonly addedKey: { readonly key: string };
  readonly clear: boolean;
  readonly deleteKey: { readonly key: string };
};

/**
 * Like a `Map` but multiple values can be stored for each key.
 * Duplicate values can be added to the same or even a several keys.
 *
 * Three pre-defined MapOf's are available:
 * * {@link ofArrayMutable} - Map of arrays
 * * {@link ofSetMutable} - Map of unique items
 * * {@link ofCircularMutable} - Hold a limited set of values per key
 *
 * Adding
 * ```js
 * // Add one or more values using the predefined key function to generate a key
 * map.addValue(value1, value2, ...);
 * // Add one or more values under a specified key
 * map.addKeyedValues(key, value1, value2, ...);
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
 * map.clear();
 * // Delete values under key. Returns _true_ if key was found.
 * map.delete(key);
 * // Deletes specified value under key. Returns _true_ if found.
 * map.deleteKeyValue(key, value);
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
 * Events can be listened to via `addEventListener`
 * * `addedKey`, `addedValue` - when a new key is added, or when a new value is added
 * * `clear` - when contents are cleared
 * * `deleteKey` - when a key is deleted
 *
 * @example Event example
 * ```js
 * map.addEventLister(`addedKey`, ev => {
 *  // New key evt.key seen.
 * });
 * ```
 *
 * @typeParam V - Values stored under keys
 * @typeParam M - Type of data structure managing values
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface IMapOfMutableExtended<V, M>
  extends SimpleEventEmitter<MapArrayEvents<V>>,
  IMapOfMutable<V> {
  /**
   * Returns the object managing values under the specified `key`
   * @private
   * @param key
   */
  getSource(key: string): M | undefined;

  /**
   * Returns the type name. For in-built implementations, it will be one of: array, set or circular
   */
  get typeName(): string;

  /**
   * Returns a human-readable rendering of contents
   */
  debugString(): string;
}
