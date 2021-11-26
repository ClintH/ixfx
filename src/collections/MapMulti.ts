type KeyType = String | Number | Symbol;
export class MapMulti<V> {
  #map: Map<KeyType, V[]> = new Map();
  constructor() {

  }

  isEmpty() {
    return (this.#map.size == 0)
  }

  clear() {
    this.#map.clear();
  }

  #_add(key: KeyType, value: V) {
    if (!this.#map.has(key)) {
      this.#map.set(key, []);
    }
    let e = this.#map.get(key);
    e?.push(value);
  }

  has(key: KeyType): boolean {
    return this.#map.has(key);
  }

  delete(key: KeyType, value: V) {
    const a = this.#map.get(key);
    if (a === undefined) return;
    const filtered = a.filter(v => v !== value);
    this.#map.set(key, filtered);
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

  add(key: KeyType, ...value: V[]) {
    for (const v of value) {
      this.#_add(key, v);
    }
  }

  /**
   * Finds the first key where value is stored. 
   * Note that value could be stored in multiple keys
   *
   * @param {V} value
   * @returns {(KeyType | undefined)}
   * @memberof MapMulti
   */
  findKey(value: V): KeyType | undefined {
    const keys = Array.from(this.#map.keys());
    for (const key of keys) {
      const a = this.#map.get(key);
      if (a === undefined) continue;

      if (a.includes(value)) return key;
    }
    return undefined;
  }

  count(key: KeyType): number {
    let e = this.#map.get(key);
    if (e !== undefined) return e.length;
    return 0;
  }

  get(key: KeyType): V[] | undefined {
    return this.#map.get(key);
  }

  keys(): KeyType[] {
    return Array.from(this.#map.keys());
  }

  keysAndCounts(): [KeyType, number][] {
    const keys = this.keys();
    const r = keys.map(k => [k, this.count(k)]) as [KeyType, number][];
    return r;
  }

  merge(other: MapMulti<V>) {
    const keys = other.keys();
    for (const key of keys) {
      const data = other.get(key);
      if (data !== undefined) this.add(key, ...data);
    }
  }
}

export function sortByAlpha<V>(map: MapMulti<V>): KeyType[] {
  let tags = map.keys();
  return tags.sort();
}

export function sortBySize<V>(map: MapMulti<V>): KeyType[] {
  const t = map.keysAndCounts();
  t.sort((aR, bR) => {
    const a = aR[1];
    const b = bR[1];
    if (a > b) return -1;
    else if (a < b) return 1;
    return 0;
  });
  return t.map(tagAndCount => tagAndCount[0]);
}