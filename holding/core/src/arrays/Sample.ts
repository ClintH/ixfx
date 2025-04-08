import { throwIntegerTest } from '../util/GuardNumbers.js';
/**
 * Samples array
 *
 * @example By percentage - get half of the items
 * ```
 * import { Arrays } from 'https://unpkg.com/ixfx/dist/data.js';
 *
 * const list = [1,2,3,4,5,6,7,8,9,10];
 * const sub = Arrays.sample(list, 0.5);
 * // Yields: [2, 4, 6, 8, 10]
 * ```
 *
 * @example By steps - every third
 * ```
 * import { Arrays } from 'https://unpkg.com/ixfx/dist/data.js';
 *
 * const list = [1,2,3,4,5,6,7,8,9,10];
 * const sub = Arrays.sample(list, 3);
 * // Yields:
 * // [3, 6, 9]
 * ```
 * @param array Array to sample
 * @param amount Amount, given as a percentage (0..1) or the number of interval (ie 3 for every third item)
 * @returns
 */
export const sample = <V>(array: ArrayLike<V>, amount: number): Array<V> => {
  //eslint-disable-next-line functional/no-let
  let subsampleSteps = 1;
  if (amount <= 1) {
    // Subsample based on a percentage
    const numberOfItems = array.length * amount;
    subsampleSteps = Math.round(array.length / numberOfItems);
  } else {
    subsampleSteps = amount;
  }

  throwIntegerTest(subsampleSteps, `positive`, `amount`);
  if (subsampleSteps > array.length - 1) {
    throw new Error(`Subsample steps exceeds array length`);
  }
  const r: Array<V> = [];

  //eslint-disable-next-line functional/no-let
  for (let index = subsampleSteps - 1; index < array.length; index += subsampleSteps) {
    //eslint-disable-next-line functional/immutable-data
    r.push(array[ index ]);
  }
  return r;
};