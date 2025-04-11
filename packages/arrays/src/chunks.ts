
/**
 * Return `arr` broken up into chunks of `size`
 *
 * ```js
 * chunks([1,2,3,4,5,6,7,8,9,10], 3);
 * // Yields: [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
 * ```
 * @param array
 * @param size
 * @returns
 */

export function chunks<V>(
  array: readonly V[],
  size: number
) {
  // https://surma.github.io/underdash/
  const output: V[][] = [];
  for (let index = 0; index < array.length; index += size) {
    output.push(array.slice(index, index + size));
  }
  return output;
}