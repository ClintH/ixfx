
import { arrayIndexTest, arrayTest, resultThrow } from "@ixfx/guards";



/**
 * Returns two separate arrays of everything that `filter` returns _true_,
 * and everything it returns _false_ on. 
 * 
 * Same idea as the in-built Array.filter, but that only returns values for one case.
 * 
 * ```js
 * const [ matching, nonMatching ] = filterAB(data, v => v.enabled);
 * // `matching` is a list of items from `data` where .enabled is true
 * // `nonMatching` is a list of items from `data` where .enabled is false
 * ```
 * @param data Array of data to filter
 * @param filter Function which returns _true_ to add items to the A list, or _false_ for items to add to the B list
 * @returns Array of two elements. The first is items that match `filter`, the second is items that do not.
 */
export const filterAB = <V>(
  data: readonly V[],
  filter: (a: V) => boolean
): [ a: V[], b: V[] ] => {
  const a: V[] = [];
  const b: V[] = [];
  for (const datum of data) {
    if (filter(datum)) a.push(datum);
    else b.push(datum);
  }
  return [ a, b ];
};

/**
 * Yields elements from `array` that match a given `predicate`, and moreover are between
 * the given `startIndex` (inclusive) and `endIndex` (exclusive).
 *
 * While this can be done with in the in-built `array.filter` function, it will
 * needlessly iterate through the whole array. It also avoids another alternative
 * of slicing the array before using `filter`.
 *
 * ```js
 * import { filterBetween } from 'https://unpkg.com/ixfx/dist/data.js';
 *
 * // Return 'registered' people between and including array indexes 5-10
 * const filtered = [...filterBetween(people, person => person.registered, 5, 10)];
 * ```
 * @param array Array to filter
 * @param predicate Filter function
 * @param startIndex Start index (defaults to 0)
 * @param endIndex End index (by default runs until end)
 */
export function* filterBetween<V>(
  array: readonly V[] | V[],
  predicate: (
    value: V,
    index: number,
    array: readonly V[] | V[]
  ) => boolean,
  startIndex?: number,
  endIndex?: number
): Generator<V> {
  resultThrow(arrayTest(array, `array`));
  if (typeof startIndex === `undefined`) startIndex = 0;
  if (typeof endIndex === `undefined`) endIndex = array.length; //- 1;

  resultThrow(arrayIndexTest(array, startIndex, `startIndex`));
  resultThrow(arrayIndexTest(array, endIndex - 1, `endIndex`));

  for (let index = startIndex; index < endIndex; index++) {
    if (predicate(array[ index ], index, array)) yield array[ index ];//t.push(array[ index ]);
  }
};

