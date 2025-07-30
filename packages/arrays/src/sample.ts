import { resultThrow, integerTest } from '@ixfx/guards';
/**
 * Samples values from an array. 
 * 
 * If `amount` is less or equal to 1, it's treated as a percentage to sample.
 * Otherwise it's treated as every _n_th value to sample.
 *
 * @example 
 * By percentage - get half of the items
 * ```
 * const list = [1,2,3,4,5,6,7,8,9,10];
 * const sub = Arrays.sample(list, 0.5);
 * // Yields: [2, 4, 6, 8, 10]
 * ```
 *
 * @example
 * By steps - every third value
 * ```
 * const list = [1,2,3,4,5,6,7,8,9,10];
 * const sub = Arrays.sample(list, 3);
 * // Yields:
 * // [3, 6, 9]
 * ```
 * @param array Array to sample
 * @param amount Amount, given as a percentage (0..1) or the number of interval (ie 3 for every third item)
 * @returns
 */
export const sample = <V>(array: ArrayLike<V>, amount: number): V[] => {
  if (!Array.isArray(array)) throw new TypeError(`Param 'array' is not actually an array. Got type: ${ typeof array }`);
  let subsampleSteps = 1;
  if (amount <= 1) {
    // Subsample based on a percentage
    const numberOfItems = array.length * amount;
    subsampleSteps = Math.round(array.length / numberOfItems);
  } else {
    subsampleSteps = amount;
  }

  resultThrow(integerTest(subsampleSteps, `positive`, `amount`));
  if (subsampleSteps > array.length - 1) {
    throw new Error(`Subsample steps exceeds array length`);
  }
  const r: V[] = [];
  for (let index = subsampleSteps - 1; index < array.length; index += subsampleSteps) {
    r.push(array[ index ]);
  }
  return r;
};