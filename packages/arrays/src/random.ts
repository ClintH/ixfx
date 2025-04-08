import { guardArray } from "@ixfxfun/guards";

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
  rand: ()=>number = Math.random
): V[] => {
  guardArray(dataToShuffle, `dataToShuffle`);

  const array = [ ...dataToShuffle ];
  for (let index = array.length - 1; index > 0; index--) {
    const index_ = Math.floor(rand() * (index + 1));
    [ array[ index ], array[ index_ ] ] = [ array[ index_ ], array[ index ] ];
  }
  return array;
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
  rand: ()=>number = Math.random
): V => {
  guardArray(array, `array`);
  return array[ Math.floor(rand() * array.length) ];
};