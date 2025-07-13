export class MapOfSimple<T> {
  #store = new Map<string, T[]>();

  /**
   * Gets a copy of the underlying array storing values at `key`, or an empty array if
   * key does not exist
   * @param key 
   * @returns 
   */
  get(key: string) {
    const arr = this.#store.get(key);
    if (!arr) return [];
    return [ ...arr ];
  }

  /**
   * Returns the number of values stored under `key`
   * @param key 
   * @returns 
   */
  size(key: string) {
    const arr = this.#store.get(key);
    if (!arr) return 0;
    return arr.length;
  }

  /**
   * Iterate over all values contained under `key`
   * @param key 
   * @returns 
   */
  *iterateKey(key: string): Generator<T> {
    const arr = this.#store.get(key);
    if (!arr) return;
    yield* arr.values();
  }

  /**
   * Iterate all values, regardless of key
   */
  *iterateValues(): Generator<T> {
    for (const key of this.#store.keys()) {
      yield* this.iterateKey(key);
    }
  }

  /**
   * Iterate all keys
   */
  *iterateKeys(): Generator<string> {
    yield* this.#store.keys();
  }

  addKeyedValues(key: string, ...values: T[]) {
    let arr = this.#store.get(key);
    if (!arr) {
      arr = [];
      this.#store.set(key, arr);
    }
    arr.push(...values);
  }

  deleteKeyValue(key: string, value: T) {
    const arr = this.#store.get(key);
    if (!arr) return false;
    const arrCopy = arr.filter(v => v !== value);
    if (arrCopy.length === arr.length) return false;
    this.#store.set(key, arrCopy);
    return true;
  }

  clear() {
    this.#store.clear();
  }
}