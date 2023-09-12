/**
 * Simple map for numbers.
 * 
 * Keys not present in map return the `defaultValue` given in the constructor
 * ```js
 * // All keys default to zero.
 * const map = new NumberMap();
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
 * const map = new NumberMap(10);
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

  get(key: K): number {
    const v = super.get(key);
    if (v === undefined) return this.defaultValue;
    return v;
  }

  reset(key: K): number {
    super.set(key, this.defaultValue);
    return this.defaultValue;
  }

  multiply(key: K, amount: number): number {
    const v = super.get(key);
    let value = v ?? this.defaultValue;
    value *= amount;
    super.set(key, value);
    return value;
  }

  add(key: K, amount = 1): number {
    const v = super.get(key);
    let value = v ?? this.defaultValue;
    value += amount;
    super.set(key, value);
    return value;
  }

  subtract(key: K, amount = 1): number {
    const v = super.get(key);
    let value = v ?? this.defaultValue;
    value -= amount;
    super.set(key, value);
    return value;
  }
}