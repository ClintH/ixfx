import {
  type IsEqual,
  isEqualDefault
} from '@ixfx/core';
import type {
  MapArrayEvents,
  IMapOfMutableExtended,
} from './imap-of-mutable-extended.js';
import type { MapMultiOpts, MultiValue } from './map-multi.js';
import { SimpleEventEmitter } from '@ixfx/events';
import type { IMapOf } from './imap-of.js';
import { toStringDefault, type ToString } from '@ixfx/core';

/**
 * @internal
 */
export class MapOfMutableImpl<V, M>
  extends SimpleEventEmitter<MapArrayEvents<V>>
  implements IMapOfMutableExtended<V, M> {
  readonly #map = new Map<string, M>();
  readonly groupBy: ToString<V>;
  readonly type: MultiValue<V, M>;

  constructor(type: MultiValue<V, M>, opts: MapMultiOpts<V> = {}) {
    super();
    this.type = type;
    this.groupBy = opts.groupBy ?? toStringDefault;
  }

  /**
   * Returns the type name. For in-built implementations, it will be one of: array, set or circular
   */
  get typeName() {
    return this.type.name;
  }

  /**
   * Returns the number of keys
   */
  get lengthKeys(): number {
    return this.#map.size;
  }

  /**
   * Returns the length of the longest child list
   */
  get lengthMax() {
    let m = 0;
    for (const v of this.#map.values()) {
      m = Math.max(m, this.type.count(v));
    }
    return m;
  }

  debugString(): string {
    const keys = [ ...this.#map.keys() ];
    let r = `Keys: ${ keys.join(`, `) }\r\n`;
    for (const k of keys) {
      const v = this.#map.get(k);
      if (v === undefined) {
        r += ` - ${ k } (undefined)\r\n`
      } else {
        const asArray = this.type.toArrayCopy(v);
        if (asArray !== undefined) {
          r += ` - ${ k } (${ this.type.count(v) }) = ${ JSON.stringify(
            asArray
          ) }\r\n`;
        }
      }
    };
    return r;
  }

  get isEmpty(): boolean {
    return this.#map.size === 0;
  }

  clear() {
    this.#map.clear();
    super.fireEvent(`clear`, true);
  }

  addKeyedValues(key: string, ...values: V[]) {
    const set = this.#map.get(key);
    if (set === undefined) {
      this.#map.set(key, this.type.addKeyedValues(undefined, values));
      super.fireEvent(`addedKey`, { key: key });
      super.fireEvent(`addedValues`, { values: values });
    } else {
      this.#map.set(key, this.type.addKeyedValues(set, values));
      super.fireEvent(`addedValues`, { values: values });
    }
  }
  set(key: string, values: V[]) {
    this.addKeyedValues(key, ...values);
    return this;
  }

  addValue(...values: readonly V[]) {
    for (const v of values) this.addKeyedValues(this.groupBy(v), v);
  }

  hasKeyValue(key: string, value: V, eq: IsEqual<V>): boolean {
    const m = this.#map.get(key);
    if (m === undefined) return false;
    return this.type.has(m, value, eq);
  }

  has(key: string): boolean {
    return this.#map.has(key);
  }

  deleteKeyValue(key: string, value: V): boolean {
    const a = this.#map.get(key);
    if (a === undefined) return false;
    return this.deleteKeyValueFromMap(a, key, value);
  }

  private deleteKeyValueFromMap(map: M, key: string, value: V): boolean {
    const preCount = this.type.count(map);
    const filtered = this.type.without(map, value);
    const postCount = filtered.length;
    this.#map.set(key, this.type.addKeyedValues(undefined, filtered));
    return preCount > postCount;
  }

  deleteByValue(value: V): boolean {
    let something = false;
    [ ...this.#map.keys() ].filter((key) => {
      const a = this.#map.get(key);
      if (!a) throw new Error(`Bug: map could not be accessed`);
      if (this.deleteKeyValueFromMap(a, key, value)) {
        something = true; // note that something was deleted

        // If key is empty, delete it
        if (this.count(key) === 0) this.delete(key);
      }
    });
    return something;
  }

  delete(key: string): boolean {
    const a = this.#map.get(key);
    if (a === undefined) return false;
    this.#map.delete(key);
    this.fireEvent(`deleteKey`, { key: key });
    return true;
  }

  firstKeyByValue(
    value: V,
    eq: IsEqual<V> = isEqualDefault
  ): string | undefined {
    const keys = [ ...this.#map.keys() ];
    const found = keys.find((key) => {
      const a = this.#map.get(key);
      if (a === undefined) throw new Error(`Bug: map could not be accessed`);
      const r = this.type.has(a, value, eq);
      return r;
    });
    return found;
  }

  count(key: string): number {
    const entry = this.#map.get(key);
    if (entry === undefined) return 0;
    return this.type.count(entry);
  }

  /**
   * Iterates over values stored under `key`
   * If `key` is not found, no error is thrown - the iterator returns no values
   * 
   * Alternatively use {@link valuesFor}
   */
  // valuesForAsArray(key: string): V[] {
  //   const m = this.#map.get(key);
  //   if (m === undefined) return [];
  //   return this.type.toArrayCopy(m);
  // }

  /**
   * Iterate over the values stored under `key`.
   * If key does not exist, iteration is essentially a no-op.
   * 
   * Alternatively, use {@valuesForAsArray} to get values as an array.
   * @param key
   * @returns
   */
  *valuesFor(key: string) {
    const m = this.#map.get(key);
    if (m === undefined) return;
    yield* this.type.iterable(m);
  }

  getSource(key: string): M | undefined {
    return this.#map.get(key);
  }

  *keys(): IterableIterator<string> {
    yield* this.#map.keys();
    //return Array.from(this.#map.keys());
  }

  *entriesFlat(): IterableIterator<[ key: string, value: V ]> {
    for (const entry of this.#map.entries()) {
      for (const v of this.type.iterable(entry[ 1 ])) {
        yield [ entry[ 0 ], v ];
      }
    }
  }

  *valuesFlat(): IterableIterator<V> {
    for (const entry of this.#map.entries()) {
      yield* this.type.iterable(entry[ 1 ]);
    }
  }

  *entries(): IterableIterator<[ key: string, value: V[] ]> {
    for (const [ k, v ] of this.#map.entries()) {
      const temporary = [ ...this.type.iterable(v) ];
      yield [ k, temporary ];
    }
  }

  *keysAndCounts(): IterableIterator<[ string, number ]> {
    for (const key of this.keys()) {
      yield [ key, this.count(key) ];
    }
  }

  merge(other: IMapOf<V>) {
    for (const key of other.keys()) {
      this.addKeyedValues(key, ...other.valuesFor(key));
    }
  }

  get size() {
    return this.#map.size;
  }


  get [ Symbol.toStringTag ]() {
    return this.#map[ Symbol.toStringTag ];
  }
}
