import { type IMapOf } from './imap-of.js';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface IMapOfMutable<V> extends IMapOf<V> {
  /**
   * Adds several `values` under the same `key`. Duplicate values are permitted, depending on implementation.
   * @param key
   * @param values
   */
  addKeyedValues(key: string, ...values: ReadonlyArray<V>): void;

  /**
   * Adds a value, automatically extracting a key via the
   * `groupBy` function assigned in the constructor options.
   * @param values Adds several values
   */
  addValue(...values: ReadonlyArray<V>): void;

  /**
   * Clears the map
   */
  clear(): void;

  /**
   * Returns the number of keys
   */
  get lengthKeys(): number;

  /**
   * Deletes all values under `key` that match `value`.
   * @param key Key
   * @param value Value
   */
  deleteKeyValue(key: string, value: V): boolean;

  /**
   * Delete all occurrences of `value`, regardless of
   * key it is stored under.
   * Returns _true_ if something was deleted.
   * @param value
   */
  deleteByValue(value: V): boolean;

  /**
   * Deletes all values stored under `key`. Returns _true_ if key was found
   * @param key
   */
  delete(key: string): boolean;
}
