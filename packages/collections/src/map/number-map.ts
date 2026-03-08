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
 * Regular `set` works as well:
 * ```js
 * map.set(`hello`, 5);
 * map.add(`hello`, 2); // 7
 * ```
 */
export class NumberMap<K> extends Map<K, number> {
  readonly defaultValue: number;

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