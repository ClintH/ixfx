import { type IMapOf } from './IMapOf';

export interface IMapOfMutable<V> extends IMapOf<V> {
  /**
   * Returns list of keys
   */
  // keys():IterableIterator<string>;// readonly string[]

  // values(key:string):IterableIterator<V>;

  /**
   * Iterates over key-value pairs.
   * Unlike a normal map, the same key may appear several times.
   */
  // entriesFlat():IterableIterator<[key:string,value:V]>

  // entries():IterableIterator<[key:string,value:V[]]>

  /**
   * Returns a list of all keys and count of items therein
   */
  //keysAndCounts(): IterableIterator<[string, number]>

  /**
   * Returns items under `key` or an empty array if `key` is not found
   * @param key
   */
  //get(key:string):ReadonlyArray<V>

  /**
   * Returns _true_ if `value` is stored under `key`.
   *
   * @param key Key
   * @param value Value
   */
  //hasKeyValue(key:string, value:V):boolean

  /**
   * Returns _true_ if `key` is stored
   * @param key
   */
  //has(key:string):boolean

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

  /**
   * Returns true if the map is empty
   */
  // get isEmpty():boolean

  /**
   * Returns the length of the longest child item
   */
  // get lengthMax():number;

  /**
   * Finds the first key where value is stored.
   * Note: value could be stored in multiple keys
   * @param value Value to seek
   * @returns Key, or undefined if value not found
   */
  // firstKeyByValue(value: V, eq?:IsEqual<V> | undefined): string | undefined

  /**
   * Returns the number of values stored under `key`, or _0_ if `key` is not present.
   * @param key Key
   */
  //count(key: string): number
}
