/**
 * Yields the result of comparing a value with a sibling.
 *
 * ```js
 * const data = [ 1, 2, 4, 8, 16 ];
 * // Compare values with its previous sibling (-1)
 * // Since -1 is the offset, the first A and B values will be 2 and 1,
 * // then 4 and 2, etc.
 * compareTo(data, -1, (a, b) => b-a)];
 * // Yields: -1, -2, -4, -8
 * ```
 *
 * Note that one less value is yielded compared to the input array.
 *
 * You can just as well go forward as well:
 * ```js
 * const data = [ 1, 2, 4, 8, 16 ];
 * // Compare values with its next-next sibling (2)
 * // With an offset of 2, the first A and B values will be 1 and 4, then
 * // 8 and 2 etc.
 * // then 4 and 2, etc.
 * compareTo(data, 2, (a, b) => b-a)];
 * // Yields: 3, 6, 12
 * ```
 * @param data
 * @param offset
 * @param fn
 */
export function *compareTo<T>(data: T[], offset: number, fn: (a: T, b: T) => T): Generator<T> {
  if (offset === 0)
    throw new TypeError(`Offset cannot be 0.`);
  if (offset < 0) {
    // Looking backwards
    offset = Math.abs(offset);
    for (let i = offset; i < data.length; i++) {
      const v = fn(data[i], data[i - offset]);
      yield v;
    }
  } else {
    // Looking forwards
    for (let i = 0; i < data.length - offset; i++) {
      const v = fn(data[i], data[i + offset]);
      yield v;
    }
  }
}