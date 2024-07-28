import { isEqualDefault, type IsEqual } from "../../util/IsEqual.js";
import { guardArray } from "./GuardArray.js";
import { guardIndex } from "./GuardIndex.js";

export const withoutUndefined = <V>(data: ReadonlyArray<V> | Array<V>): Array<V> => {
  return data.filter(v => v !== undefined);
}

/**
 * Returns two separate arrays of everything that `filter` returns _true_,
 * and everything it returns _false_ on. The in-built Array.filter() in
 * constrast only returns things that `filter` returns _true_ for.
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
  data: ReadonlyArray<V>,
  filter: (a: V) => boolean
): [ a: Array<V>, b: Array<V> ] => {
  const a: Array<V> = [];
  const b: Array<V> = [];
  for (const datum of data) {
    //eslint-disable-next-line functional/immutable-data
    if (filter(datum)) a.push(datum);
    //eslint-disable-next-line functional/immutable-data
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
  array: ReadonlyArray<V> | Array<V>,
  predicate: (
    value: V,
    index: number,
    array: ReadonlyArray<V> | Array<V>
  ) => boolean,
  startIndex?: number,
  endIndex?: number
): Generator<V> {
  guardArray(array);
  if (typeof startIndex === `undefined`) startIndex = 0;
  if (typeof endIndex === `undefined`) endIndex = array.length; //- 1;
  guardIndex(array, startIndex, `startIndex`);
  guardIndex(array, endIndex - 1, `endIndex`);

  //const t: Array<V> = [];

  //eslint-disable-next-line functional/no-let
  for (let index = startIndex; index < endIndex; index++) {
    //eslint-disable-next-line functional/immutable-data
    if (predicate(array[ index ], index, array)) yield array[ index ];//t.push(array[ index ]);
  }
  //return t;
};


/**
 * Returns an array with value(s) omitted. If value is not found, result will be a copy of input.
 * Value checking is completed via the provided `comparer` function.
 * By default checking whether `a === b`. To compare based on value, use the `isEqualValueDefault` comparer.
 *
 * @example
 * ```js
 * import { Arrays } from 'https://unpkg.com/ixfx/dist/data.js';
 *
 * const data = [100, 20, 40];
 * const filtered = Arrays.without(data, 20); // [100, 40]
 * ```
 *
 * @example Using value-based comparison
 * ```js
 * import { Arrays } from 'https://unpkg.com/ixfx/dist/data.js';
 *
 * const data = [{name: `Alice`}, {name:`Sam`}];
 *
 * // This wouldn't work as expected, because the default comparer uses instance,
 * // not value:
 * Arrays.without(data, {name: `Alice`});
 *
 * // So instead we can use a value comparer:
 * Arrays.without(data, {name:`Alice`}, isEqualValueDefault);
 * ```
 *
 * @example Use a function
 * ```js
 * import { Arrays } from 'https://unpkg.com/ixfx/dist/data.js';
 *
 * const data = [{name: `Alice`}, {name:`Sam`}];
 * Arrays.without(data, {name:`ALICE`}, (a, b) => {
 *  return (a.name.toLowerCase() === b.name.toLowerCase());
 * });
 * ```
 *
 * Consider {@link remove} to remove an item by index.
 *
 * @typeParam V - Type of array items
 * @param sourceArray Source array
 * @param toRemove Value(s) to remove
 * @param comparer Comparison function. If not provided `Util.isEqualDefault` is used, which compares using `===`
 * @return Copy of array without value.
 */
export const without = <V>(
  //eslint-disable-next-line functional/prefer-readonly-type
  sourceArray: ReadonlyArray<V> | Array<V>,
  toRemove: V | Array<V>,
  comparer: IsEqual<V> = isEqualDefault
): Array<V> => {
  if (Array.isArray(toRemove)) {
    const returnArray = []
    for (const source of sourceArray) {
      if (!toRemove.some(v => comparer(source, v))) {
        returnArray.push(source);
      }
    }
    return returnArray;
  } else {
    return sourceArray.filter((v) => !comparer(v, toRemove));
  }
}