/// TODO: NEEDS TESTING
import { ToString, IsEqual, toStringDefault, isEqualDefault } from "../util";

export type MapMultiOpts<V> = {
  readonly valueComparer: IsEqual<V>|undefined
  readonly stringifier: ToString<V>|undefined
}


export class MutableMapMulti<V> {
  /* eslint-disable-next-line functional/prefer-readonly-type */
  #map: Map<string, V[]> = new Map();
  
  readonly valueComparer: IsEqual<V>;
  readonly stringifier: ToString<V>;

  constructor(opts:MapMultiOpts<V>) {
    this.stringifier = opts.stringifier ?? toStringDefault;
    this.valueComparer = opts.valueComparer ?? isEqualDefault;
  }

  get isEmpty():boolean {
    return (this.#map.size === 0);
  }

  clear() {
    this.#map.clear();
  }

  /**
   * Adds several values with the same static key. Duplicate values are permitted.
   *
   * @param {string} key Key for values
   * @param {...V[]} value Values
   * @memberof MapMulti
   */
  addKeyedValues(key: string, ...value: ReadonlyArray<V>) {
    const set = this.#map.get(key);
    if (set === undefined) {
      this.#map.set(key, [...value]);
    } else {
      set.push(...value);
    }
  }

  addValue(v:V) {
    this.addKeyedValues(this.stringifier(v), v);
  }

  hasKey(key: string): boolean {
    return this.#map.has(key);
  }

  hasValue(key:string, value:V):boolean {
    const m = this.#map.get(key);
    if (m === undefined) return false;
    if (this.#valueEquality === undefined)
      return m.includes(value);
    else
      // TODO value equality

    return this.hasKey(this.#keyString(value));
  }

  deleteKeyedValue(key: string, value: V) {
    const a = this.#map.get(key);
    if (a === undefined) return;
    const filtered = a.filter(v => v !== value);
    this.#map.set(key, filtered);
  }

  delete(value:V) {
    this.deleteKeyedValue(this.#keyString(value), value);
  }
  /**
   * Deletes all occurences of value regardless of key
   *
   * @param {V} value
   * @memberof MapMulti
   */
  deleteDeep(value: V) {
    const keys = Array.from(this.#map.keys());

    keys.forEach(k => {
      const a = this.#map.get(k);
      if (a === undefined) return;
      const b = a.filter(v => v !== value);
      this.#map.set(k, b);
    });
  }

  /**
   * Finds the first key where value is stored. 
   * Note that value could be stored in multiple keys
   *
   * @param {V} value
   * @returns {(string | undefined)}
   * @memberof MapMulti
   */
  findKeyForValue(value: V): string | undefined {
    const keys = Array.from(this.#map.keys());
    keys.forEach(key => {
      const a = this.#map.get(key);
      if (a === undefined) return;
      if (a.includes(value)) return key;
    });
    return undefined;
  }

  count(key: string): number {
    const e = this.#map.get(key);
    if (e === undefined) return 0;
    return e.length;
  }

  get(key: string): readonly V[] | undefined {
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

  merge(other: MutableMapMulti<V>) {
    const keys = other.keys();
    keys.forEach(key => {
      const data = other.get(key);
      if (data !== undefined) this.addKeyedValues(key, ...data);
    });
  }
}

export const sortByAlpha = <V>(map: MutableMapMulti<V>): readonly string[] => map.keys().sort();

export const sortBySize = <V>(map: MutableMapMulti<V>): readonly string[] => {
  const t = map.keysAndCounts();
  t.sort((aR, bR) => {
    const a = aR[1];
    const b = bR[1];
    if (a > b) return -1;
    else if (a < b) return 1;
    return 0;
  });
  return t.map(tagAndCount => tagAndCount[0]);
};