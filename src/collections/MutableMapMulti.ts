// ✔ UNIT TESTED
import {SimpleEventEmitter} from "../Events.js";
import { ToString, IsEqual, toStringDefault, isEqualDefault } from "../util.js";
import { addUniqueByHash } from "./Set.js";
import { hasAnyValue as mapHasAnyValue,  toArray as mapToArray, find as mapFind, filter as mapFilter} from './Map.js';
import {  without } from './Arrays.js';
import {MutableCircularArray, mutableCircularArray} from './MutableCircularArray.js';

export type MapMultiOpts<V> = {
  /**
   * Returns true if two values should be considered equal.
   * 
   * @type {(IsEqual<V>|undefined)}
   */
 // readonly valueComparer?: IsEqual<V>|undefined

 /**
  * Returns a group for values added via `addValue`. Eg. maybe you want to 
  * group values in the shape `{name: 'Samantha' city: 'Copenhagen'}` by city:
  * 
  * ```
  * const opts = {
  *  groupBy: (v) => v.city
  * }
  * ```
  *
  * @type {(ToString<V>|undefined)}
  */
 readonly groupBy?: ToString<V>|undefined
}

type MutableMapArrayEvents<V> = {
  readonly addedValues: {readonly values: ReadonlyArray<V>}
  readonly addedKey: {readonly key: string }
  readonly clear: boolean
  readonly deleteKey: {readonly key: string}
}

export type MultiValue<V, M> = Readonly<{
  has(source:M, value:V): boolean
  add(destination:M|undefined, values:ReadonlyArray<V>):M
  toArray(source:M): ReadonlyArray<V>|undefined
  find(source:M, predicate:(v:V) => boolean): V|unknown
  filter(source:M, predicate:(v:V) => boolean): ReadonlyArray<V>
  without(source:M, value:V): ReadonlyArray<V>
  count(source:M): number
}>;

/**
 * Like a `Map` but multiple values can be stored for each key. 
 * Duplicate values can be added to the same or even a several keys.
 * 
 * By default, equality is based on value rather than reference.
 *
 * @export
 * @class MutableMapMulti
 * @template V
 */
export class MutableMapOf<V, M>  extends SimpleEventEmitter<MutableMapArrayEvents<V>> {
  /* eslint-disable-next-line functional/prefer-readonly-type */
  readonly #map: Map<string, M> = new Map();
  //readonly valueComparer: IsEqual<V>;
  readonly groupBy: ToString<V>;
  readonly type: MultiValue<V, M>;

  /**
   * Constructor.
   * 
   * By default it will group by the string representation of values and use
   * reference matching for values.
   * @param {MapMultiOpts<V>} [opts={}]
   * @memberof MutableMapMulti
   */
  constructor(type:MultiValue<V, M>, opts:MapMultiOpts<V> = {}) {
    super();
    this.type = type;
    this.groupBy = opts.groupBy ?? toStringDefault;
    // this.valueComparer = opts.valueComparer ?? isEqualDefault;
  }

  debugString(): string {
    const keys = Array.from(this.#map.keys());
    // eslint-disable-next-line functional/no-let
    let r = `Keys: ${keys.join(`, `)}\r\n`;
    keys.forEach(k => {
      const v = this.#map.get(k);
      if (v !== undefined) {
        const asArray = this.type.toArray(v);
        if (asArray !== undefined) {
          r += ` - ${k} (${this.type.count(v)}) = ${JSON.stringify(asArray)}\r\n`;
        }
      } else r += ` - ${k} (undefined)\r\n`;
    });
    return r;
  }

  /**
   * Returns true if the map is empty
   *
   * @readonly
   * @type {boolean}
   * @memberof MutableMapMulti
   */
  get isEmpty():boolean {
    return (this.#map.size === 0);
  }

  /**
   * Clears the map
   *
   * @memberof MutableMapMulti
   */
  clear() {
    this.#map.clear();
    super.fireEvent(`clear`, true);
  }

  /**
   * Adds several values under the same key. Duplicate values are permitted.
   *
   * @param {string} key Key for values
   * @param {...V[]} value Values
   * @memberof MapMulti
   */
  addKeyedValues(key: string, ...values: ReadonlyArray<V>) {
    const set = this.#map.get(key);
    //console.log(`addKeyedValues: key: ${key} values: ${JSON.stringify(values)}`);
    if (set === undefined) {
      this.#map.set(key, this.type.add(undefined, values));
      super.fireEvent(`addedKey`, {key:key});
      super.fireEvent(`addedValues`, {values: values});
    } else {
      // eslint-disable-next-line functional/immutable-data
      this.#map.set(key, this.type.add(set, values));
      super.fireEvent(`addedValues`, {values: values});
    }
  }

  /**
   * Adds a value, automatically extracting a key via the
   * `groupBy` function assigned in the constructor options.
   *
   * @param {V} values
   * @memberof MutableMapArray
   */
  addValue(...values:ReadonlyArray<V>) {
    values.forEach(v => this.addKeyedValues(this.groupBy(v), v));
  }

  /**
   * Returns true if `value` is stored under `key`.
   *
   * By default values are compared by value, not reference.
   * 
   * @param {string} key
   * @param {V} value
   * @return {*}  {boolean}
   * @memberof MutableMapArray
   */
  hasKeyValue(key:string, value:V):boolean {    
    const m = this.#map.get(key);
    if (m === undefined) return false;    
    return this.type.has(m, value);
  }

  has(key:string):boolean {
    return this.#map.has(key);
  }

  /**
   * Deletes all values under the specified key that match the given value.
   *
   * @param {string} key
   * @param {V} value
   * @return {*} 
   * @memberof MutableMapArray
   */
  deleteKeyValue(key: string, value: V) {
    const a = this.#map.get(key);
    if (a === undefined) return;
    const filtered = this.type.without(a, value);// this.type.filter(a, v => !this.valueComparer(v, value));
    this.#map.set(key, this.type.add(undefined, filtered));
  }

  delete(key:string): boolean {
    const a = this.#map.get(key);
    if (a === undefined) return false;
    this.#map.delete(key);
    this.fireEvent(`deleteKey`, {key: key});
    return true;
  }

  /**
   * Deletes all occurences of `value` regardless of key
   *
   * @param {V} value
   * @memberof MapMulti
   */
  // deleteDeep(value: V) {
  //   const keys = Array.from(this.#map.keys());

  //   keys.forEach(k => {
  //     const a = this.#map.get(k);
  //     if (a === undefined) return;
  //     const b = this.type.filter(a, v => !this.valueComparer(v, value));
  //     this.#map.set(k, this.type.add(undefined, b));
  //   });
  // }

  /**
   * Finds the first key where value is stored. 
   * Note: value could be stored in multiple keys
   *
   * @param {V} value
   * @returns {(string | undefined)}
   * @memberof MapMulti
   */
  findKeyForValue(value: V): string | undefined {
    const keys = Array.from(this.#map.keys());
    const found = keys.find(key => {
      const a = this.#map.get(key);
      if (a === undefined) throw Error(`Bug: map could not be accessed`);
      if (this.type.has(a, value)) return true;
      return false;
    });
    return found;
  }

  /**
   * Returns the number of values stored under `key`, or 0 if key is not present.
   *
   * @param {string} key
   * @return {*}  {number}
   * @memberof MutableMapArray
   */
  count(key: string): number {
    const e = this.#map.get(key);
    if (e === undefined) return 0;
    return this.type.count(e);
  }

  /**
   * Returns the array of values stored under `key`
   * or undefined if key does not exist
   *
   * @param {string} key
   * @return {*}  {readonly}
   * @memberof MutableMapArray
   */
  get(key: string): readonly V[] | undefined {
    const m = this.#map.get(key);
    if (m === undefined) return undefined;
    return this.type.toArray(m);
  }

  getSource(key:string): M|undefined {
    return this.#map.get(key);
  }

  /* eslint-disable-next-line functional/prefer-readonly-type */
  keys(): string[] {
    return Array.from(this.#map.keys());
  }

  /* eslint-disable-next-line functional/prefer-readonly-type */
  keysAndCounts(): Array<[string, number]> {
    const keys = this.keys();
    /* eslint-disable-next-line functional/prefer-readonly-type */
    const r = keys.map(k => [k, this.count(k)]) as Array<[string, number]>;
    return r;
  }

  merge(other: MutableMapOf<V, M>) {
    const keys = other.keys();
    keys.forEach(key => {
      const data = other.get(key);
      if (data !== undefined) this.addKeyedValues(key, ...data);
    });
  }
}

export type MapArrayOpts<V> = MapMultiOpts<V> & {
  readonly comparer?:IsEqual<V>
  readonly toString?:ToString<V>
}

// ✔ UNIT TESTED
export const mutableMapArray = <V>(opts:MapArrayOpts<V> = {}) => {
  const comparer = opts.comparer === undefined ?
    opts.toString === undefined ? (a:V, b:V) => opts.toString(a) === opts.toString(b) :
      isEqualDefault
    : opts.comparer;
    
  const t:MultiValue<V, ReadonlyArray<V>> = {
    add:(dest, values) => {
      if (dest === undefined) return [...values];
      return [...dest, ...values];
    },
    count: (source) => source.length,
    find: (source, predicate) => source.find(predicate),
    filter: (source, predicate) => source.filter(predicate),
    toArray: (source) => source,
    has: (source, value) => source.find(v => comparer(v, value)) !== undefined,
    without: (source, value) => source.filter(v => !comparer(v, value))
  };
  const m = new MutableMapOf<V, ReadonlyArray<V>>(t, opts);
  return m;
};

export type MapSetOpts<V> = MapMultiOpts<V> & {
  readonly hash:ToString<V>
};

export const mutableMapSet = <V>(opts?:MapSetOpts<V>) => {
  const hash = opts?.hash ?? toStringDefault;
  const comparer = (a:V, b:V) => hash(a) === hash(b);

  const t:MultiValue<V, ReadonlyMap<string, V>> = {
    add:(dest, values) => addUniqueByHash(dest, hash, ...values),
    count: (source) => source.size,
    find: (source, predicate) => mapFind(source, predicate),
    filter: (source, predicate) => mapFilter(source, predicate),
    toArray: (source) => mapToArray(source),
    has: (source, value) => mapHasAnyValue(source, value, comparer),
    without: (source, value) => without(mapToArray(source), value, comparer)
  };
  const m = new MutableMapOf<V, ReadonlyMap<string, V>>(t, opts);
  return m;
};

export type MapCircularOpts<V> = MapMultiOpts<V> & {
  readonly capacity:number
}
export const mutableMapCircular = <V>(opts:MapCircularOpts<V>) => {
  const comparer = isEqualDefault;

  const t:MultiValue<V, MutableCircularArray<V>> = {
    add:(dest, values) => {
      if (dest === undefined) dest = mutableCircularArray<V>(opts.capacity);
      values.forEach(v => dest = dest?.add(v));
      return dest;
    },
    count: (source) => source.length,
    find: (source, predicate) => source.find(predicate),
    filter: (source, predicate) => source.filter(predicate),
    toArray: (source) => source,
    has: (source, value) => source.find(v => comparer(v, value)) !== undefined,
    without: (source, value) => source.filter(v => !comparer(v, value))
  };
  return new MutableMapOf<V, MutableCircularArray<V>>(t, opts);
};