/**
 * Simple map for numbers.
 * 
 * Keys not present in map return the `defaultValue` given in the constructor
 * ```js
 * // All keys default to zero.
 * const map = new Maps.NumberMap();
 * map.get(`hello`); // 0
 * ```
 * 
 * To check if a key is present, use `has`:
 * ```js
 * map.has(`hello`); // false
 * ```
 * 
 * Math:
 * ```js
 * // Adds 1 by default to value of `hello`
 * map.add(`hello`);         // 1
 * map.multiply(`hello`, 2); // 2 
 * 
 * // Reset key to default value
 * map.reset(`hello`); // 0
 * ```
 * 
 * Different default value:
 * ```js
 * const map = new Maps.NumberMap(10);
 * map.get(`hello`); // 10
 * ```
 * 
 * Regular `set` works, overriding the value to whatever is given:
 * ```js
 * map.set(`hello`, 5);
 * map.add(`hello`, 2); // 7
 * ```
 */
export class NumberMap<K> extends Map<K, number> {
  readonly defaultValue: number;

  /**
   * Creates a NumberMap with default value of 0
   */
  constructor(defaultValue = 0) {
    super();
    this.defaultValue = defaultValue;
  }

  /**
   * Gets the value at a key. If not found, returns the default value
   * @param key 
   * @returns 
   */
  get(key: K): number {
    const v = super.get(key);
    if (v === undefined) return this.defaultValue;
    return v;
  }

  /**
   * Resets the key's value to the default value
   * @param key 
   * @returns 
   */
  reset(key: K): number {
    super.set(key, this.defaultValue);
    return this.defaultValue;
  }

  /**
   * Multiplies the value of `key` by `amount`. If key is not found, it is treated as the default value.
   * The new value is set and returned.
   * @param key 
   * @param amount 
   * @returns 
   */
  multiply(key: K, amount: number): number {
    const v = super.get(key);
    let value = v ?? this.defaultValue;
    value *= amount;
    super.set(key, value);
    return value;
  }

    /**
   * Divides the value of `key` by `amount`. If key is not found, it is treated as the default value.
   * The new value is set and returned.
   * @param key 
   * @param amount 
   * @returns 
   */
  divide(key: K, amount: number): number {
    const v = super.get(key);
    let value = v ?? this.defaultValue;
    value /= amount;
    super.set(key, value);
    return value;
  }

  /**
   * Applies a function to all values
   * ```js
   * // Round all the values
   * map.mapValue((value,key)=> Math.round(value));
   * ```
   */
  mapValue(fn:(value:number, key?:K)=>number):void {
    for (const [key, value] of this.entries()) {
      const newValue = fn(value, key);
      super.set(key, newValue);
    }
  }

  /**
   * Returns the largest value in the map. If the map is empty, returns `NaN`.
  * ```js
   * // Eg find all the keys corresponding to the maximum value
   * const largestKeys = [...map.keysByValue(map.findValueMax())];
   * ```
   * @returns 
   */
  findValueMax():number {
    if (this.size === 0) return Number.NaN;
    let maxValue = Number.MIN_VALUE;
    for (const value of this.values()) {
      if (value > maxValue) {
        maxValue = value;
      }
    }
    return maxValue;
  }

  /**
   * Returns the smallest value in the map. If the map is empty, returns `NaN`.
   * 
   * ```js
   * // Eg find all the keys corresponding to the minimum value
   * const smallestKeys = [...map.keysByValue(map.findValueMin())];
   * ```
   * @returns 
   */
  findValueMin():number {
    if (this.size === 0) return Number.NaN;
    let minValue = Number.MAX_SAFE_INTEGER;
    for (const value of this.values()) {
      if (value < minValue) {
        minValue = value;
      }
    }
    return minValue;
  }

  /**
   * Iterates over all keys that have a corresponding value
   * @param v 
   */
  *keysByValue(v:number): Generator<K, void, unknown> {
    for (const [key, value] of this.entries()) {
      if (value === v) yield key;
    }
  }


  /**
   * Iterates over entries, sorted by value. By default ascending order.
   */
  *entriesSorted(sorter?:(a:[K,number], b:[K,number]) => number):Generator<[key:K,value:number]> {
    const entries = [...this.entries()];
    if (sorter) {
      entries.sort(sorter);
    } else {
      entries.sort((a, b) => a[1] - b[1]);
    }
    for (const entry of entries) {
      yield entry;
    }
  }


  /**
   * Iterates over all keys that have a value matching `fn`.
   * ```js
   * // Iterate over all keys that store a value greater than 1
   * const greaterThanOne = (v) => v > 1;
   * for (const key of map.filterKeysByValue(greaterThanOne)) {
   * }
   * ```
   * @param v 
   */
  *filterKeysByValue(fn:(value:number)=>boolean): Generator<K, void, unknown> {
    for (const [key, value] of this.entries()) {
      if (fn(value)) yield key;
    }
  }

  /**
   * Deletes a set of keys
   */
  deleteKeys(keys: Iterable<K>): number {
    let deleted = 0;
    for (const key of keys) {
      if (super.delete(key)) deleted++;
    }
    return deleted;
  }

  /**
   * Adds an amount to `key`'s value. If `key` is not found, it is treated as the default value. The new value is set and returned.
   * @param key 
   * @param amount 
   * @returns 
   */
  add(key: K, amount = 1): number {
    const v = super.get(key);
    let value = v ?? this.defaultValue;
    value += amount;
    super.set(key, value);
    return value;
  }

  /**
   * Subtracts an amount from `key`'s value. If `key` is not found, it is treated as the default value. The new value is set and returned.
   * @param key 
   * @param amount 
   * @returns 
   */
  subtract(key: K, amount = 1): number {
    const v = super.get(key);
    let value = v ?? this.defaultValue;
    value -= amount;
    super.set(key, value);
    return value;
  }
}