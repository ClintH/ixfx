import { arrayTest, resultThrow } from "@ixfx/guards";
import { weightedIndex } from "./weighted-index.js";
import type { RandomSource } from "./types.js";

/**
 * Returns a random array index.
 *
 * ```js
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
 * Returns a random value from `array`,
 * and removes it from the array.
 * 
 * ```js
 * const data = [100,20,50];
 * const v = randomPluck(data, { mutate: true });
 * // eg: v: 20, data is now [100,50]
 * ```
 * @param array 
 * @param options 
 */
export function randomPluck<V>(
  array: readonly V[] | V[],
  options: { mutate: true, source?: RandomSource }
): V | undefined;

/**
 * Returns a random element from an array
 * along with the remaining elements. Does not
 * modify the original array.
 * ```js
 * const data = [100,20,50];
 * const {value,remainder} = randomPluck(data);
 * // eg: value: 20, remainder: [100,50], data remains [100,20,50]
 * ```
 * @param array 
 * @param options 
 */
export function randomPluck<V>(
  array: readonly V[] | V[],
  options?: { mutate: false, source?: RandomSource }
): { value: V, remainder: V[] };

/**
 * Plucks a random value from an array, optionally mutating
 * the original array.
 * 
 * @example Get a random element without modifying array
 * ```js
 * const { value, remainder } = randomPluck(inputArray);
 * ```
 * 
 * @example Get a random element, removing it from original array
 * ```js
 * const value = randomPluck(inputArray, { mutate: true });
 * ```
 * 
 * If the input array is empty, _undefined_ is returned as the value.
 * @typeParam V - Type of items in array
 * @param array Array to pluck item from
 * @param options Options. By default { mutate: false, source: Math.random }
 * @param rand Random generator. `Math.random` by default.
 *
 */
export function randomPluck<V>(
  array: readonly V[] | V[],
  options: Partial<{ mutate: boolean, source: RandomSource }> = {}
): undefined | V | { readonly value: V | undefined; readonly remainder: V[] } {
  if (typeof array === `undefined`) throw new Error(`Param 'array' is undefined`);
  if (!Array.isArray(array)) throw new Error(`Param 'array' is not an array`);

  const mutate = options.mutate ?? false;
  const rand = options.source ?? Math.random;

  if (array.length === 0) {
    if (mutate) return undefined;
    return { value: undefined, remainder: [] };
  }

  const index = randomIndex(array, rand);
  if (mutate) {
    // Return bare value
    const v = array[ index ];
    array.splice(index, 1)
    return v;
  } else {
    // Copy array, remove item from that
    const inputCopy = [ ...array ];
    inputCopy.splice(index, 1);
    return {
      value: array[ index ],
      remainder: inputCopy,
    };
  }
};


/**
 * Returns random element.
 *
 * ```js
 * const v = [`blue`, `red`, `orange`];
 * randomElement(v); // Yields `blue`, `red` or `orange`
 * ```
 *
 * Use {@link randomIndex} if you want a random index within `array`.
 *
 * @param array
 * @param rand Random generator. `Math.random` by default.
 * @returns
 */
export const randomElement = <V>(
  array: ArrayLike<V>,
  rand: RandomSource = Math.random
): V => {
  resultThrow(arrayTest(array, `array`));
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
export const randomElementWeightedSource = <V>(array: ArrayLike<V>, weightings: number[], randomSource: RandomSource = Math.random) => {
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
 * const d = [1, 2, 3, 4];
 * const s = shuffle(d);
 * // d: [1, 2, 3, 4], s: [3, 1, 2, 4]
 * ```
 * @param dataToShuffle
 * @param rand Random generator. `Math.random` by default.
 * @returns Copy with items moved around randomly
 * @typeParam V - Type of array items
 */
export const shuffle = <V>(
  dataToShuffle: readonly V[],
  rand: RandomSource = Math.random
): V[] => {
  const array = [ ...dataToShuffle ];
  for (let index = array.length - 1; index > 0; index--) {
    const index_ = Math.floor(rand() * (index + 1));
    [ array[ index ], array[ index_ ] ] = [ array[ index_ ], array[ index ] ];
  }
  return array;
};