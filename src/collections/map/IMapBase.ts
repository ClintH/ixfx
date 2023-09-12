
//eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface IMapBase<K, V> {
  /**
   * Gets an item by key
   * @example
   * ```js
   * const item = map.get(`hello`);
   * ```
   * @param key
   */
  get(key: K): V | undefined;

  /**
 * Returns _true_ if map contains key
 * @example
 * ```js
 * if (map.has(`hello`)) ...
 * ```
 * @param key
 */
  has(key: K): boolean;

  /**
* Returns _true_ if map is empty
*/
  isEmpty(): boolean;
  /**
   * Iterates over entries (consisting of [key,value])
   * @example
   * ```js
   * for (const [key, value] of map.entries()) {
   *  // Use key, value...
   * }
   * ```
   */
  entries(): IterableIterator<readonly [ K, V ]>;

  values(): IterableIterator<V>;
}