import type { IsEqual, ToString } from '@ixfx/core';
import type { IMapOfImmutable } from './imap-of-immutable.js';
import type { IMapOf } from './imap-of.js';
import { defaultKeyer, isEqualDefault } from '@ixfx/core';
import { MapOfSimpleBase } from './map-of-simple-base.js';

/**
 * Simple immutable MapOf
 */
export class MapOfSimple<V>
  extends MapOfSimpleBase<V>
  implements IMapOf<V>, IMapOfImmutable<V> {
  /**
   * Returns a new instance wrapping `map` without copying it.
   * Value arrays are never changed in place, so they can be shared between instances.
   */
  #withMap(map: Map<string, readonly V[]>): MapOfSimple<V> {
    const m = new MapOfSimple<V>(this.groupBy, this.valueEq);
    m.map = map;
    return m;
  }

  /**
   * Appends grouped values, copying the map once.
   * Each key's array is rebuilt once, regardless of how many values are added under it.
   */
  #addGrouped(grouped: Iterable<readonly [ key: string, values: readonly V[] ]>): MapOfSimple<V> {
    const m = new Map(this.map);
    for (const [key, values] of grouped) {
      const existing = m.get(key);
      m.set(key, existing === undefined ? [...values] : [...existing, ...values]);
    }
    return this.#withMap(m);
  }

  addKeyedValues(key: string, ...values: V[]): MapOfSimple<V> {
    return this.#addGrouped([[key, values]]);
  }

  addValue(...values: readonly V[]): MapOfSimple<V> {
    if (values.length === 0)
      return this;
    const grouped = new Map<string, V[]>();
    for (const v of values) {
      const key = this.groupBy(v);
      const list = grouped.get(key);
      if (list === undefined)
        grouped.set(key, [v]);
      else list.push(v);
    }
    return this.#addGrouped(grouped);
  }

  addBatch(batch: Array<[ key: string, value: V[] ]>): MapOfSimple<V> {
    return this.#addGrouped(batch);
  }

  clear(): MapOfSimple<V> {
    if (this.map.size === 0)
      return this;
    return new MapOfSimple<V>(this.groupBy, this.valueEq);
  }

  deleteKeyValue(_key: string, _value: V, eq?: IsEqual<V>): MapOfSimple<V> {
    const eqFunction = eq ?? this.valueEq;
    const existing = this.map.get(_key);
    if (existing === undefined)
      return this;
    const values = existing.filter(v => !eqFunction(v, _value));
    if (values.length === existing.length)
      return this;

    const m = new Map(this.map);
    if (values.length === 0)
      m.delete(_key);
    else m.set(_key, values);
    return this.#withMap(m);
  }

  deleteByValue(value: V, eq?: IsEqual<V>): MapOfSimple<V> {
    const eqFunction = eq ?? this.valueEq;
    // Only copy the map if something is actually removed
    let m: Map<string, readonly V[]> | undefined;
    for (const [key, existing] of this.map) {
      const values = existing.filter(vv => !eqFunction(vv, value));
      if (values.length === existing.length)
        continue;
      m ??= new Map(this.map);
      if (values.length === 0)
        m.delete(key);
      else m.set(key, values);
    }
    return m === undefined ? this : this.#withMap(m);
  }

  delete(key: string): MapOfSimple<V> {
    if (!this.map.has(key))
      return this;
    const m = new Map(this.map);
    m.delete(key);
    return this.#withMap(m);
  }
}

/**
 * A simple immutable map of arrays, without events. It can store multiple values
 * under the same key.
 *
 * For a fancier approaches, consider {@link ofArrayMutable}, {@link ofCircularMutable} or {@link ofSetMutable}.
 *
 * @example
 * ```js
 * let m = mapSimple();
 * m = m.add(`hello`, 1, 2, 3); // Adds numbers under key `hello`
 * m = m.delete(`hello`);       // Deletes everything under `hello`
 *
 * const hellos = m.get(`hello`); // Get list of items under `hello`
 * ```
 *
 * @typeParam V - Type of items
 * @returns New instance
 */
export function ofSimple<V>(groupBy: ToString<V> = defaultKeyer, valueEq: IsEqual<V> = isEqualDefault<V>): IMapOfImmutable<V> {
  return new MapOfSimple<V>(groupBy, valueEq);
}
