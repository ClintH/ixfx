
/**
 * Groups data by a function `grouper`, returning data as a map with string
 * keys and array values. Multiple values can be assigned to the same group.
 *
 * `grouper` must yield a string designated group for a given item.
 *
 * @example
 * ```js
 * const data = [
 *  { age: 39, city: `London` },
 *  { age: 14, city: `Copenhagen` },
 *  { age: 23, city: `Stockholm` },
 *  { age: 56, city: `London` }
 * ];
 *
 * // Whatever the function returns will be the designated group
 * // for an item
 * const map = Arrays.groupBy(data, item => item.city);
 * ```
 *
 * This yields a Map with keys London, Stockholm and Copenhagen, and the corresponding values.
 *
 * ```
 * London: [{ age: 39, city: `London` }, { age: 56, city: `London` }]
 * Stockhom: [{ age: 23, city: `Stockholm` }]
 * Copenhagen: [{ age: 14, city: `Copenhagen` }]
 * ```
 * @param array Array to group
 * @param grouper Function that returns a key for a given item
 * @typeParam K Type of key to group by. Typically string.
 * @typeParam V Type of values
 * @returns Map
 */
export const groupBy = <K, V>(
  array: Iterable<V>,
  grouper: (item: V) => K
) => {
  const map = new Map<K, V[]>();

  for (const a of array) {
    const key = grouper(a);
    let existing = map.get(key);
    if (!existing) {
      existing = [];
      map.set(key, existing);
    }
    existing.push(a);
  }
  return map;
};