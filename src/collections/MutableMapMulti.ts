/// TODO: NEEDS TESTING

import { KeyString } from "../util";

//type KeyType = String | Number | Symbol;

export class MutableMapMulti<V> {
  #map: Map<string, V[]> = new Map();
  readonly #keyString: KeyString<V>;
  
  constructor(keyString: KeyString<V> | undefined = undefined) {
    if (keyString === undefined) {
      keyString = (a) => {
        if (typeof a === `string`) { 
          return a;
        } else { 
          return JSON.stringify(a);
        }
      };
    }
    this.#keyString = keyString;
  }

  isEmpty() {
    return (this.#map.size === 0);
  }

  clear() {
    this.#map.clear();
  }

  /**
   * Adds several values with the same static key
   *
   * @param {string} key Key for values
   * @param {...V[]} value Values
   * @memberof MapMulti
   */
  addKeyedValues(key: string, ...value: V[]) {
    let set = this.#map.get(key);
    if (set === undefined) {
      set = [];
      this.#map.set(key, set);
    }
    set.push(...value);
  }

  add(v:V) {
    this.addKeyedValues(this.#keyString(v), v);
  }

  hasKey(key: string): boolean {
    return this.#map.has(key);
  }

  has(value:V):boolean {
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
    for (const key of keys) {
      const a = this.#map.get(key);
      if (a === undefined) continue;
      const b = a.filter(v => v !== value);
      this.#map.set(key, b);
    }
  }

  /**
   * Finds the first key where value is stored. 
   * Note that value could be stored in multiple keys
   *
   * @param {V} value
   * @returns {(string | undefined)}
   * @memberof MapMulti
   */
  findKey(value: V): string | undefined {
    const keys = Array.from(this.#map.keys());
    for (const key of keys) {
      const a = this.#map.get(key);
      if (a === undefined) continue;

      if (a.includes(value)) return key;
    }
    return undefined;
  }

  count(key: string): number {
    const e = this.#map.get(key);
    if (e === undefined) return 0;
    return e.length;
  }

  get(key: string): V[] | undefined {
    return this.#map.get(key);
  }

  keys(): string[] {
    return Array.from(this.#map.keys());
  }

  keysAndCounts(): [string, number][] {
    const keys = this.keys();
    const r = keys.map(k => [k, this.count(k)]) as [string, number][];
    return r;
  }

  merge(other: MapMulti<V>) {
    const keys = other.keys();
    for (const key of keys) {
      const data = other.get(key);
      if (data !== undefined) this.addKeyedValues(key, ...data);
    }
  }
}

export const sortByAlpha = <V>(map: MapMulti<V>): string[] =>  map.keys().sort();

export const sortBySize = <V>(map: MapMulti<V>): string[] => {
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