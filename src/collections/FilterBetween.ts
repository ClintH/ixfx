import { guardArray } from "./GuardArray.js";
import { guardIndex } from "./GuardIndex.js";

/**
 * Return elements from `array` that match a given `predicate`, and moreover are between
 * the given `startIndex` (inclusive) and `endIndex` (exclusive).
 *
 * While this can be done with in the in-built `array.filter` function, it will
 * needlessly iterate through the whole array. It also avoids another alternative
 * of slicing the array before using `filter`.
 *
 * ```js
 * import { filterBetween } from 'https://unpkg.com/ixfx/dist/arrays.js';
 *
 * // Return 'registered' people between and including array indexes 5-10
 * const filtered = filterBetween(people, person => person.registered, 5, 10);
 * ```
 * @param array Array to filter
 * @param predicate Filter function
 * @param startIndex Start index (defaults to 0)
 * @param endIndex End index (by default runs until end)
 */
export const filterBetween = <V>(
  array: ReadonlyArray<V> | Array<V>,
  predicate: (
    value: V,
    index: number,
    array: ReadonlyArray<V> | Array<V>
  ) => boolean,
  startIndex?: number,
  endIndex?: number
): Array<V> => {
  guardArray(array);
  if (typeof startIndex === `undefined`) startIndex = 0;
  if (typeof endIndex === `undefined`) endIndex = array.length; //- 1;
  guardIndex(array, startIndex, `startIndex`);
  guardIndex(array, endIndex - 1, `endIndex`);

  const t: Array<V> = [];

  //eslint-disable-next-line functional/no-let
  for (let index = startIndex; index < endIndex; index++) {
    //eslint-disable-next-line functional/immutable-data
    if (predicate(array[ index ], index, array)) t.push(array[ index ]);
  }
  return t;
};