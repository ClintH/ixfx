import { defaultKeyer } from '../../DefaultKeyer.js';
import { type IsEqual, isEqualDefault } from '../../util/IsEqual.js';
import { firstEntryByValue } from './MapMultiFns.js';

export class MapOfSimpleBase<V> {
  protected map: Map<string, ReadonlyArray<V>>;
  protected readonly groupBy;
  protected valueEq;

  /**
   * Constructor
   * @param groupBy Creates keys for values when using `addValue`. By default uses JSON.stringify
   * @param valueEq Compare values. By default uses JS logic for equality
   */
  constructor(
    groupBy: (value: V) => string = defaultKeyer,
    valueEq: IsEqual<V> = isEqualDefault<V>,
    initial: Array<[ string, ReadonlyArray<V> ]> = []
  ) {
    this.groupBy = groupBy;
    this.valueEq = valueEq;
    this.map = new Map(initial);
  }

  /**
   * Returns _true_ if `key` exists
   * @param key
   * @returns
   */
  has(key: string): boolean {
    return this.map.has(key);
  }

  /**
   * Returns _true_ if `value` exists under `key`.
   * @param key Key
   * @param value Value to seek under `key`
   * @returns _True_ if `value` exists under `key`.
   */
  hasKeyValue(key: string, value: V): boolean {
    const values = this.map.get(key);
    if (!values) return false;
    for (const v of values) {
      if (this.valueEq(v, value)) return true;
    }
    return false;
  }

  /**
   * Debug dump of contents
   * @returns
   */
  debugString(): string {
    // eslint-disable-next-line functional/no-let
    let r = ``;
    const keys = [ ...this.map.keys() ];
    keys.every((k) => {
      const v = this.map.get(k);
      if (v === undefined) return;
      r += k + ` (${ v.length }) = ${ JSON.stringify(v) }\r\n`;
    });
    return r;
  }

  /**
   * Return number of values stored under `key`.
   * Returns 0 if `key` is not found.
   * @param key
   * @returns
   */
  count(key: string): number {
    const values = this.map.get(key);
    if (!values) return 0;
    return values.length;
  }


  /**
 * Returns first key that contains `value`
 * @param value 
 * @param eq 
 * @returns 
 */
  firstKeyByValue(value: V, eq: IsEqual<V> = isEqualDefault) {
    const entry = firstEntryByValue(this, value, eq);
    if (entry) return entry[ 0 ];
  }

  /**
   * Iterate over all entries
   */
  *entriesFlat(): IterableIterator<[ key: string, value: V ]> {
    for (const key of this.map.keys()) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      for (const value of this.map.get(key)!) {
        yield [ key, value ];
      }
    }
  }

  /**
   * Iterate over keys and array of values for that key
   */
  *entries(): IterableIterator<[ key: string, value: Array<V> ]> {
    for (const [ k, v ] of this.map.entries()) {
      yield [ k, [ ...v ] ];
    }
  }


  /**
   * Get all values under `key`
   * @param key
   * @returns
   */
  *get(key: string): IterableIterator<V> {
    const m = this.map.get(key);
    if (!m) return;
    yield* m.values();
  }

  /**
   * Iterate over all keys
   */
  *keys(): IterableIterator<string> {
    yield* this.map.keys();
  }

  /**
   * Iterate over all values (regardless of key).
   * Use {@link values} to iterate over a set of values per key
   */
  *valuesFlat(): IterableIterator<V> {
    for (const entries of this.map) {
      yield* entries[ 1 ];
    }
  }

  /**
   * Yields the values for each key in sequence, returning an array.
   * Use {@link valuesFlat} to iterate over all keys regardless of key.
   */
  *values(): IterableIterator<ReadonlyArray<V>> {
    for (const entries of this.map) {
      yield entries[ 1 ];
    }
  }
  /**
   * Iterate over keys and length of values stored under keys
   */
  *keysAndCounts(): IterableIterator<[ string, number ]> {
    for (const entries of this.map) {
      yield [ entries[ 0 ], entries[ 1 ].length ];
    }
  }

  /**
   * Returns the count of keys.
   */
  get lengthKeys() {
    return this.map.size;
  }

  /**
  * _True_ if empty
  */
  get isEmpty(): boolean {
    return this.map.size === 0;
  }

}
