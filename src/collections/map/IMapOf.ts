import type { IsEqual } from '../../util/IsEqual.js';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface IMapOf<V> {
  /**
   * Iterates over all keys
   */
  keys(): IterableIterator<string>;

  /**
   * Iterates over all values stored under `key`
   * @param key
   */
  get(key: string): IterableIterator<V>;

  /**
   * Iterates over all values, regardless of key.
   * Same value may re-appear if it's stored under different keys.
   */
  valuesFlat(): IterableIterator<V>;

  /**
   * Iterates over key-value pairs.
   * Unlike a normal map, the same key may appear several times.
   */
  entriesFlat(): IterableIterator<readonly [ key: string, value: V ]>;

  /**
   * Iteates over all keys and the count of values therein
   */
  keysAndCounts(): IterableIterator<readonly [ string, number ]>;

  /**
   * Returns _true_ if `value` is stored under `key`.
   *
   * @param key Key
   * @param value Value
   */
  hasKeyValue(key: string, value: V, eq?: IsEqual<V>): boolean;

  /**
   * Returns _true_ if `key` has any values
   * @param key
   */
  has(key: string): boolean;

  /**
   * Returns _true_ if the map is empty
   */
  get isEmpty(): boolean;
  /**
   * Returns the number of values stored under `key`, or _0_ if `key` is not present.
   * @param key Key
   */
  count(key: string): number;

  /**
   * Finds the first key where value is stored.
   * Note: value could be stored in multiple keys
   * @param value Value to seek
   * @returns Key, or undefined if value not found
   */
  firstKeyByValue(value: V, eq?: IsEqual<V> | undefined): string | undefined;
}
