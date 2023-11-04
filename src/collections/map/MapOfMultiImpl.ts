import {
  type IsEqual,
  isEqualDefault
} from '../../IsEqual.js';
import type {
  MapArrayEvents,
  IMapOfMutableExtended,
} from './IMapOfMutableExtended.js';
import type { MapMultiOpts, MultiValue } from './MapMulti.js';
import { SimpleEventEmitter } from '../../Events.js';
import type { IMapOf } from './IMapOf.js';
import { toStringDefault, type ToString } from '../../Util.js';

/**
 * @internal
 */
export class MapOfMutableImpl<V, M>
  extends SimpleEventEmitter<MapArrayEvents<V>>
  implements IMapOfMutableExtended<V, M>
{
  /* eslint-disable-next-line functional/prefer-readonly-type */
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
    //eslint-disable-next-line functional/no-let
    let m = 0;
    for (const v of this.#map.values()) {
      m = Math.max(m, this.type.count(v));
    }
    return m;
  }

  debugString(): string {
    const keys = [ ...this.#map.keys() ];
    // eslint-disable-next-line functional/no-let
    let r = `Keys: ${ keys.join(`, `) }\r\n`;
    for (const k of keys) {
      const v = this.#map.get(k);
      if (v === undefined) {
        r += ` - ${ k } (undefined)\r\n`
      } else {
        const asArray = this.type.toArray(v);
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

  //eslint-disable-next-line functional/prefer-immutable-types
  addKeyedValues(key: string, ...values: Array<V>) {
    const set = this.#map.get(key);
    if (set === undefined) {
      this.#map.set(key, this.type.add(undefined, values));
      super.fireEvent(`addedKey`, { key: key });
      super.fireEvent(`addedValues`, { values: values });
    } else {
      // eslint-disable-next-line functional/immutable-data
      this.#map.set(key, this.type.add(set, values));
      super.fireEvent(`addedValues`, { values: values });
    }
  }
  //eslint-disable-next-line functional/prefer-immutable-types
  set(key: string, values: Array<V>) {
    this.addKeyedValues(key, ...values);
    return this;
  }

  addValue(...values: ReadonlyArray<V>) {
    for (const v of values) this.addKeyedValues(this.groupBy(v), v);
  }

  hasKeyValue(key: string, value: V, eq: IsEqual<V>): boolean {
    const m = this.#map.get(key);
    if (m === undefined) return false;
    return this.type.has(m, value, eq);
  }

  //eslint-disable-next-line functional/prefer-tacit
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
    this.#map.set(key, this.type.add(undefined, filtered));
    return preCount > postCount;
  }

  deleteByValue(value: V): boolean {
    //eslint-disable-next-line functional/no-let
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
   * An empty array is returned if there are no values
   */
  *get(key: string): IterableIterator<V> {
    const m = this.#map.get(key);
    if (m === undefined) return;
    yield* this.type.iterable(m);
  }

  /**
   * Iterate over the values stored under `key`.
   * If key does not exist, iteration is essentially a no-op
   * @param key
   * @returns
   */
  *valuesFor(key: string) {
    const m = this.#map.get(key);
    if (m === undefined) return;
    yield* this.type.iterable(m);
  }

  //eslint-disable-next-line functional/prefer-tacit
  getSource(key: string): M | undefined {
    return this.#map.get(key);
  }

  /* eslint-disable-next-line functional/prefer-readonly-type */
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

  *entries(): IterableIterator<[ key: string, value: Array<V> ]> {
    //yield* this.#map.entries();
    for (const [ k, v ] of this.#map.entries()) {
      const temporary = [ ...this.type.iterable(v) ];
      yield [ k, temporary ];
    }
  }

  /* eslint-disable-next-line functional/prefer-readonly-type */
  *keysAndCounts(): IterableIterator<[ string, number ]> {
    //const keys = this.keys();
    /* eslint-disable-next-line functional/prefer-readonly-type */
    //const r = keys.map(k => [k, this.count(k)]) as Array<[string, number]>;
    //return r;

    for (const key of this.keys()) {
      yield [ key, this.count(key) ];
    }
  }

  merge(other: IMapOf<V>) {
    // const keys = other.keys();
    // keys.forEach(key => {
    //   const data = other.get(key);
    //   if (data !== undefined) this.addKeyedValues(key, ...data);
    // });
    for (const key of other.keys()) {
      const data = other.get(key);
      this.addKeyedValues(key, ...data);
    }
  }

  get size() {
    return this.#map.size;
  }
  /*
    forEach_(
      fn: (
        value: ReadonlyArray<V>,
        key: string,
        //eslint-disable-next-line functional/prefer-immutable-types
        map: Map<string, ReadonlyArray<V>>
      ) => void,
      _?: any
    ) {
      // for (const [key,value] of this.#map.entries()) {
      //   value
      // }
      // @ts-expect-error
      this.#map.forEach(fn);
    }
    */

  get [ Symbol.toStringTag ]() {
    return this.#map[ Symbol.toStringTag ];
  }

  // [Symbol.iterator]() {
  //   return this.type[Symbol.iterator]();
  // }
}
