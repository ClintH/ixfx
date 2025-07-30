import { arrayIndexTest, resultThrow } from "@ixfx/guards";

/**
 * Removes an element at `index` index from `data`, returning the resulting array without modifying the original.
 *
 * ```js
 * const v = [ 100, 20, 50 ];
 * const vv = Arrays.remove(2);
 *
 * Yields:
 *  v: [ 100, 20, 50 ]
 * vv: [ 100, 20 ]
 * ```
 *
 * Consider {@link without} if you want to remove an item by value.
 *
 * Throws an exception if `index` is outside the range of `data` array.
 * @param data Input array
 * @param index Index to remove
 * @typeParam V Type of array
 * @returns
 */
export const remove = <V>(
  data: readonly V[] | V[],
  index: number
): V[] => {
  if (!Array.isArray(data)) {
    throw new TypeError(`'data' parameter should be an array`);
  }
  resultThrow(arrayIndexTest(data, index, `index`));

  return [ ...data.slice(0, index), ...data.slice(index + 1) ];
};