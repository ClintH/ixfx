import { defaultKeyer } from '../../DefaultKeyer.js';
import { type IsEqual, isEqualDefault } from '../../util/IsEqual.js';
import type { IMapOfMutable } from './IMapOfMutable.js';
import { MapOfSimpleBase } from './MapOfSimpleBase.js';

/**
 * A simple mutable map of arrays, without events. It can store multiple values
 * under the same key.
 *
 * For a fancier approaches, consider ofArrayMutable, ofCircularMutable or ofSetMutable.
 *
 * @example
 * ```js
 * const m = mapOfSimpleMutable();
 * m.add(`hello`, 1, 2, 3); // Adds numbers under key `hello`
 * m.delete(`hello`);       // Deletes everything under `hello`
 *
 * const hellos = m.get(`hello`); // Get list of items under `hello`
 * ```
 *
 * Constructor takes a `groupBy` parameter, which yields a string key for a value. This is the
 * basis by which values are keyed when using `addValues`.
 *
 * Constructor takes a `valueEq` parameter, which compares values. This is used when checking
 * if a value exists under a key, for example.
 * @typeParam V - Type of items
 */
export class MapOfSimpleMutable<V>
  extends MapOfSimpleBase<V>
  implements IMapOfMutable<V> {
  addKeyedValues(key: string, ...values: ReadonlyArray<V>) {
    const existing = this.map.get(key);
    if (existing === undefined) {
      this.map.set(key, values);
    } else {
      this.map.set(key, [ ...existing, ...values ]);
    }
  }


  /**
   * Adds a value, automatically extracting a key via the
   * `groupBy` function assigned in the constructor options.
   * @param values Adds several values
   */
  addValue(...values: ReadonlyArray<V>) {
    for (const v of values) {
      const key = this.groupBy(v);
      this.addKeyedValues(key, v);
    }
  }

  /**
   * Delete `value` under a particular `key`
   * @param key
   * @param value
   * @returns _True_ if `value` was found under `key`
   */
  deleteKeyValue(key: string, value: V): boolean {
    const existing = this.map.get(key);
    if (existing === undefined) return false;
    const without = existing.filter((existingValue) => !this.valueEq(existingValue, value));
    this.map.set(key, without);
    return without.length < existing.length;
  }

  /**
   * Deletes `value` regardless of key.
   *
   * Uses the constructor-defined equality function.
   * @param value Value to delete
   * @returns
   */
  deleteByValue(value: V): boolean {
    //eslint-disable-next-line functional/no-let
    let del = false;
    const entries = [ ...this.map.entries() ];
    for (const keyEntries of entries) {
      for (const values of keyEntries[ 1 ]) {
        if (this.valueEq(values, value)) {
          del = true;
          this.deleteKeyValue(keyEntries[ 0 ], value);
        }
      }
    }
    return del;
  }

  /**
   * Deletes all values under `key`,
   * @param key
   * @returns _True_ if `key` was found and values stored
   */
  delete(key: string): boolean {
    const values = this.map.get(key);
    if (!values) return false;
    if (values.length === 0) return false;
    this.map.delete(key);
    return true;
  }

  /**
   * Clear contents
   */
  clear() {
    this.map.clear();
  }
}

/**
 * A simple mutable map of arrays, without events. It can store multiple values
 * under the same key.
 *
 * For a fancier approaches, consider {@link ofArrayMutable}, {@link ofCircularMutable} or {@link ofSetMutable}.
 *
 * @example
 * ```js
 * const m = mapOfSimpleMutable();
 * m.add(`hello`, 1, 2, 3); // Adds numbers under key `hello`
 * m.delete(`hello`);       // Deletes everything under `hello`
 *
 * const hellos = m.get(`hello`); // Get list of items under `hello`
 * ```
 *
 * @typeParam V - Type of items
 * @returns New instance
 */
export const ofSimpleMutable = <V>(
  groupBy: (value: V) => string = defaultKeyer,
  valueEq: IsEqual<V> = isEqualDefault<V>
): IMapOfMutable<V> => new MapOfSimpleMutable<V>(groupBy, valueEq);
