import { arrayIndexTest, arrayTest, integerTest, throwIfFailed } from "@ixfx/guards";

/**
 * Inserts `values` at position `index`, shuffling remaining
 * items further down and returning changed result.
 * 
 * Does not modify the input array.
 * 
 * ```js
 * const data = [ 1, 2, 3 ]
 * 
 * // Inserts 20,30,40 at index 1
 * Arrays.insertAt(data, 1, 20, 30, 40);
 * 
 * // Yields: 1, 20, 30, 40, 2, 3
 * ```
 * @param data 
 * @param index 
 * @param values 
 * @returns 
 */
export const insertAt = <V>(
  data: readonly V[] | V[],
  index: number,
  ...values: V[]
): V[] => {
  throwIfFailed(
    arrayTest(data, `data`),
    arrayIndexTest(data, index, `index`)
  );

  // Adding at end
  if (index === data.length - 1) {
    return [ ...data, ...values ];
  }
  // Adding at beginning
  if (index === 0) {
    return [ ...values, ...data ];
  }
  return [ ...data.slice(0, index), ...values, ...data.slice(index) ];
};