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
    throw new TypeError(`Parameter 'data' should be an array`);
  }
  resultThrow(arrayIndexTest(data, index, `index`));

  return [ ...data.slice(0, index), ...data.slice(index + 1) ];
};

/**
 * Removes items from `input` array that match `predicate`.
 * A modified array is returned along with the number of items removed.
 * 
 * If `predicate` matches no items, a new array will still be returned, and the removed count will be 0.
 * 
 * @param input 
 * @param predicate 
 * @returns 
 */
export const removeByFilter = <T>(input: T[], predicate: (value: T) => boolean): [ changed: T[], removed: number ] => {
  if (!Array.isArray(input)) {
    throw new TypeError(`Parameter 'input' should be an array`);
  }
  if (typeof predicate !== `function`) throw new TypeError(`Parameter 'prediate' should be a function. Got type: ${ typeof predicate }`);

  const count = input.length;
  const changed = input.filter(v => !predicate(v));
  return [ changed, count - changed.length ];
}