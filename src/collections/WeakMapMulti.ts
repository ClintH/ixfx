type KeyType = String | Number | Symbol;

export class WeakMapMulti<V> {
  #map = new WeakMap<KeyType, V[]>();
  constructor() {

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

  add(key: KeyType, ...value: V[]) {
    for (const v of value) {
      this.#_add(key, v);
    }
  }

  delete(key: KeyType, value: V) {
    let list = this.#map.get(key);
    if (list === undefined) return;
    list = list.filter(v => v !== value);
  }

  count(key: KeyType): number {
    let e = this.#map.get(key);
    if (e !== undefined) return e.length;
    return 0;
  }

  get(key: KeyType): V[] | undefined {
    return this.#map.get(key);
  }
}
