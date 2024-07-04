import { weightedIndex } from "../../random/WeightedIndex.js";
import type { RandomSource } from "../../random/Types.js";
import { guardArray } from "./GuardArray.js";

/**
 * Returns a random array index.
 *
 * ```js
 * import { randomIndex } from 'https://unpkg.com/ixfx/dist/arrays.js';
 *
 * const v = [`blue`, `red`, `orange`];
 * randomIndex(v); // Yields 0, 1 or 2
 * ```
 *
 * Use {@link randomElement} if you want a value from `array`, not index.
 *
 * @param array Array
 * @param rand Random generator. `Math.random` by default.
 * @returns
 */
export const randomIndex = <V>(
  array: ArrayLike<V>,
  rand: RandomSource = Math.random
): number => Math.floor(rand() * array.length);


/**
 * Removes a random item from an array, returning both the item and the new array as a result.
 * Does not modify the original array unless `mutate` parameter is true.
 *
 * @example Without changing source
 * ```js
 * import { randomPluck } from 'https://unpkg.com/ixfx/dist/arrays.js';
 *
 * const data = [100, 20, 40];
 * const {value, array} = randomPluck(data);
 * // value: 20, array: [100, 40], data: [100, 20, 40];
 * ```
 *
 * @example Mutating source
 * ```js
 * import { randomPluck } from 'https://unpkg.com/ixfx/dist/arrays.js';
 *
 * const data = [100, 20, 40];
 * const {value} = randomPluck(data, true);
 * // value: 20, data: [100, 40];
 * ```
 *
 * @template V Type of array
 * @param array Array to pluck item from
 * @param mutate If _true_, changes input array. _False_ by default.
 * @param random Random generatr. `Math.random` by default.
 * @return Returns an object `{value:V|undefined, array:V[]}`
 *
 */
export const randomPluck = <V>(
  array: ReadonlyArray<V> | Array<V>,
  mutate = false,
  rand: RandomSource = Math.random
): { readonly value: V | undefined; readonly array: Array<V> } => {
  if (array === undefined) throw new Error(`array is undefined`);
  if (!Array.isArray(array)) throw new Error(`'array' param is not an array`);
  if (array.length === 0) return { value: undefined, array: [] };
  const index = randomIndex(array, rand);
  if (mutate) {
    return {
      value: array[ index ],
      //eslint-disable-next-line functional/immutable-data
      array: array.splice(index, 1),
    };
  } else {
    // Copy array, remove item from that
    const t = [ ...array ];
    //eslint-disable-next-line functional/immutable-data
    t.splice(index, 1);
    return {
      value: array[ index ],
      array: t,
    };
  }
};


/**
 * Returns random element.
 *
 * ```js
 * import { randomElement } from 'https://unpkg.com/ixfx/dist/arrays.js';
 *
 * const v = [`blue`, `red`, `orange`];
 * randomElement(v); // Yields `blue`, `red` or `orange`
 * ```
 *
 * Use {@link randomIndex} if you want a random index within `array`.
 *
 * @param array
 * @params rand Random generator. `Math.random` by default.
 * @returns
 */
export const randomElement = <V>(
  array: ArrayLike<V>,
  rand: RandomSource = Math.random
): V => {
  guardArray(array, `array`);
  return array[ Math.floor(rand() * array.length) ];
};


/**
 * Selects a random array index, biased by the provided `weightings`.
 * 
 * In the below example, `a` will be picked 20% of the time, `b` 50% and so on.
 * ```js
 * const data =    [  `a`,  `b`,  `c`,  `d` ]
 * const weights = [ 0.2,  0.5,  0.1,  0.2 ] 
 * ```
 * @param array 
 * @param weightings 
 * @param randomSource 
 */
export const randomElementWeightedSource = <V>(array: ArrayLike<V>, weightings: Array<number>, randomSource: RandomSource = Math.random) => {
  if (array.length !== weightings.length) throw new Error(`Lengths of 'array' and 'weightings' should be the same.`);
  const r = weightedIndex(weightings, randomSource);
  return (): V => {
    const index = r();
    return array[ index ];
  }
}

/**
 * Returns a shuffled copy of the input array.
 * @example
 * ```js
 * import { shuffle } from 'https://unpkg.com/ixfx/dist/arrays.js';
 *
 * const d = [1, 2, 3, 4];
 * const s = shuffle(d);
 * // d: [1, 2, 3, 4], s: [3, 1, 2, 4]
 * ```
 * @param dataToShuffle
 * @param rand Random generator. `Math.random` by default.
 * @returns Copy with items moved around randomly
 * @template V Type of array items
 */
export const shuffle = <V>(
  dataToShuffle: ReadonlyArray<V>,
  rand: RandomSource = Math.random
): Array<V> => {
  const array = [ ...dataToShuffle ];
  // eslint-disable-next-line  functional/no-let
  for (let index = array.length - 1; index > 0; index--) {
    const index_ = Math.floor(rand() * (index + 1));
    [ array[ index ], array[ index_ ] ] = [ array[ index_ ], array[ index ] ];
  }
  return array;
};