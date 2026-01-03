import { arrayTest, functionTest, resultThrow } from "@ixfx/guards";

/**
 * Returns a shuffled copy of the input array.
 * @example
 * ```js
 * const d = [1, 2, 3, 4];
 * const s = shuffle(d);
 * // d: [1, 2, 3, 4], s: [3, 1, 2, 4]
 * ```
 * 
 * It can be useful to randomly access each item from an array exactly once:
 * ```js
 * for (const value of shuffle(inputArray)) {
 *  // Do something with the value...
 * }
 * ```
 * 
 * @throws {TypeError} If `array` is not an array and `rand` is not a function
 * @param dataToShuffle Input array
 * @param rand Random generator. `Math.random` by default.
 * @returns Copy with items moved around randomly
 * @typeParam V - Type of array items
 */
export const shuffle = <V>(
  dataToShuffle: readonly V[],
  rand: () => number = Math.random
): V[] => {
  resultThrow(
    arrayTest(dataToShuffle, `dataToShuffle`),
    functionTest(rand, `rand`)
  );
  const array = [ ...dataToShuffle ];
  for (let index = array.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(rand() * (index + 1));
    [ array[ index ], array[ randomIndex ] ] = [ array[ randomIndex ], array[ index ] ];
  }
  return array;
};

/**
 * Returns a random element of an array
 *
 * ```js
 * const v = [`blue`, `red`, `orange`];
 * randomElement(v); // Yields `blue`, `red` or `orange`
 * ```
 *
 * Note that repeated calls might yield the same value
 * multiple times. If you want to random unique values, consider using {@link shuffle}.
 * 
 * See also:
 * * {@link randomIndex} if you want a random index rather than value.
 * 
 * @throws {TypeError} If `array` is not an array and `rand` is not a function
 * @param array
 * @param rand Random generator. `Math.random` by default.
 * @returns
 */
export const randomElement = <V>(
  array: ArrayLike<V>,
  rand: () => number = Math.random
): V => {
  resultThrow(
    arrayTest(array, `array`),
    functionTest(rand, `rand`)
  );
  return array[ Math.floor(rand() * array.length) ];
};

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
 * @throws {TypeError} If `array` is not an array and `rand` is not a function
 * @param array Array
 * @param rand Random generator. `Math.random` by default.
 * @returns
 */
export const randomIndex = <V>(
  array: ArrayLike<V>,
  rand: () => number = Math.random
): number => {
  resultThrow(
    arrayTest(array, `array`),
    functionTest(rand, `rand`)
  );
  return Math.floor(rand() * array.length);
}