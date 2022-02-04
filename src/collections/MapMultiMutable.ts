// ✔ UNIT TESTED
import { SimpleEventEmitter } from "../Events.js";
import { ToString, toStringDefault, isEqualDefault } from "../util.js";
import { hasAnyValue as mapHasAnyValue,  toArray as mapToArray, find as mapFind, filter as mapFilter, addUniqueByHash} from './Map.js';
import { without } from './Arrays.js';
import { circularArray } from './CircularArray.js';
import {CircularArray, MapArrayEvents, MapArrayOpts, MapCircularOpts, MapMultiOpts, MapOfMutable, MapSetOpts, MultiValue} from "./Interfaces.js";

class MapOfMutableImpl<V, M> extends SimpleEventEmitter<MapArrayEvents<V>> {
  /* eslint-disable-next-line functional/prefer-readonly-type */
  readonly #map: Map<string, M> = new Map();
  readonly groupBy: ToString<V>;
  readonly type: MultiValue<V, M>;

  constructor(type:MultiValue<V, M>, opts:MapMultiOpts<V> = {}) {
    super();
    this.type = type;
    this.groupBy = opts.groupBy ?? toStringDefault;
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

  get isEmpty():boolean {
    return (this.#map.size === 0);
  }

  clear() {
    this.#map.clear();
    super.fireEvent(`clear`, true);
  }

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

  addValue(...values:ReadonlyArray<V>) {
    values.forEach(v => this.addKeyedValues(this.groupBy(v), v));
  }

  hasKeyValue(key:string, value:V):boolean {    
    const m = this.#map.get(key);
    if (m === undefined) return false;    
    return this.type.has(m, value);
  }

  has(key:string):boolean {
    return this.#map.has(key);
  }

  deleteKeyValue(key: string, value: V):boolean {
    const a = this.#map.get(key);
    if (a === undefined) return false;
    const preCount = this.type.count(a);

    const filtered = this.type.without(a, value);// this.type.filter(a, v => !this.valueComparer(v, value));
    const postCount = filtered.length;
    this.#map.set(key, this.type.add(undefined, filtered));
    return preCount > postCount;
  }

  delete(key:string): boolean {
    const a = this.#map.get(key);
    if (a === undefined) return false;
    this.#map.delete(key);
    this.fireEvent(`deleteKey`, {key: key});
    return true;
  }

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

  merge(other: MapOfMutable<V, M>) {
    const keys = other.keys();
    keys.forEach(key => {
      const data = other.get(key);
      if (data !== undefined) this.addKeyedValues(key, ...data);
    });
  }
}

// ✔ UNIT TESTED
/**
 * Returns a {@link MapOfMutable} to allow storing multiple values under a key, unlike a regular Map.
 * @example
 * ```js
 * const map = mapArray();
 * map.add(`hello`, [1,2,3,4]); // Adds series of numbers under key `hello`
 * 
 * const hello = map.get(`hello`); // Get back values
 * ```
 * 
 * Takes options { comparer: {@link IsEqual}, toString: {@link ToString}}
 * 
 * A custom {@link ToString} function can be provided which is used when checking value equality (`has`, `without`)
 * ```js
 * const map = mapArray({toString:(v) => v.name}); // Compare values based on their `name` field;
 * ``` 
 * 
 * Alternatively, a {@link IsEqual} function can be used:
 * ```js
 * const map = mapArray({comparer: (a, b) => a.name === b.name });
 * ```
 * @param opts 
 * @template V Data type of items 
 * @returns {@link MapOfMutable}
 */
export const mapArray = <V>(opts:MapArrayOpts<V> = {}) => {
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
  const m = new MapOfMutableImpl<V, ReadonlyArray<V>>(t, opts);
  return m;
};

/**
 * Returns a {@link MapOfMutable} that uses a set to hold values.
 * This means that only unique values are stored under each key. By default it
 * uses the JSON representation to compare items. 
 * 
 * Options: { hash: {@link ToString} }
 * 
 * @example Only storing the newest three items per key
 * ```js
 * const map = mapSetMutable();
 * map.add(`hello`, [1, 2, 3, 1, 2, 3]);
 * const hello = map.get(`hello`); // [1, 2, 3]
 * ```
 * 
 * Provide a {@link ToString} function for custom equality checking
 * 
 * @example
 * ```js
 * const hash = (v) => v.name; // Use name as the key
 * const map = mapSetMutable(hash);
 * map.add(`hello`, {age:40, name: `Mary`});
 * map.add(`hello`, {age:29, name: `Mary`}); // Value ignored as same name exists
 * ```
 * @param opts 
 * @returns {@link MapOfMutable}
 */
export const mapSet = <V>(opts?:MapSetOpts<V>) => {
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
  const m = new MapOfMutableImpl<V, ReadonlyMap<string, V>>(t, opts);
  return m;
};

/**
 * Returns a {@link MapOfMutable} that uses a {@link CircularArray} to hold values.
 * This means that the number of values stored under each key will be limited to the defined
 * capacity.
 * 
 * Requires options: { capacity: number}
 * 
 * @example Only storing the newest three items per key
 * ```js
 * const map = mapCircular({capacity: 3});
 * map.add(`hello`, [1, 2, 3, 4, 5]);
 * const hello = map.get(`hello`); // [3, 4, 5]
 * ```
 * @param opts 
 * @returns
 */
export const mapCircular = <V>(opts:MapCircularOpts<V>):MapOfMutable<V, CircularArray<V>> => {
  const comparer = isEqualDefault;

  const t:MultiValue<V, CircularArray<V>> = {
    add:(dest, values) => {
      if (dest === undefined) dest = circularArray<V>(opts.capacity);
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
  return new MapOfMutableImpl<V, CircularArray<V>>(t, opts);
};
