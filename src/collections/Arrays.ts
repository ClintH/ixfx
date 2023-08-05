/**
 * Functions for working with primitive arrays, regardless of type
 * See Also: NumericArrays.ts
 */

import { pushUnique } from '../IterableSync.js';
import { integer as guardInteger } from '../Guards.js';
import { defaultRandom, type RandomSource } from '../Random.js';
import {
  type IsEqual,
  isEqualDefault,
  isEqualValueDefault,
  type ToString,
} from '../Util.js';
export * from './NumericArrays.js';

/**
 * Throws an error if `array` parameter is not a valid array
 *
 * ```js
 * import { guardArray } from 'https://unpkg.com/ixfx/dist/arrays.js';
 * guardArray(someVariable);
 * ```
 * @private
 * @param array
 * @param paramName
 */
export const guardArray = <V>(array: ArrayLike<V>, paramName: string = `?`) => {
  if (array === undefined) {
    throw new Error(`Param '${paramName}' is undefined. Expected array.`);
  }
  if (array === null) {
    throw new Error(`Param '${paramName}' is null. Expected array.`);
  }
  if (!Array.isArray(array)) {
    throw new Error(`Param '${paramName}' not an array as expected`);
  }
};

/**
 * Throws if `index` is an invalid array index for `array`, and if
 * `array` itself is not a valid array.
 * @param array
 * @param index
 */
export const guardIndex = <V>(
  array: ArrayLike<V>,
  index: number,
  paramName: string = `index`
) => {
  guardArray(array);
  guardInteger(index, `positive`, paramName);
  if (index > array.length - 1) {
    throw new Error(
      `'${paramName}' ${index} beyond array max of ${array.length - 1}`
    );
  }
};

/**
 * Returns _true_ if all the contents of the array are identical.
 *
 * @example Uses default equality function:
 * ```js
 * import { valuesEqual } from 'https://unpkg.com/ixfx/dist/arrays.js';
 *
 * const a1 = [10, 10, 10];
 * valuesEqual(a1); // True
 *
 * const a2 = [ {name:`Jane`}, {name:`John} ];
 * valuesEqual(a2); // True, because JSON version captures value
 * ```
 *
 * If we want to compare by value for objects that aren't readily
 * converted to JSON, you need to provide a function:
 *
 * ```js
 * valuesEqual(someArray, (a, b) => {
 *  return (a.eventType === b.eventType);
 * });
 * ```
 *
 * Returns _true_ if `array` is empty.
 * @param array Array
 * @param equality Equality checker. Uses string-conversion checking by default
 * @returns
 */
export const valuesEqual = <V>(
  //eslint-disable-next-line functional/prefer-readonly-type
  array: ReadonlyArray<V> | Array<V>,
  equality?: IsEqual<V>
): boolean => {
  // Unit tested

  if (!Array.isArray(array)) throw new Error(`Param 'array' is not an array.`);
  if (array.length === 0) return true;
  const eq = equality === undefined ? isEqualValueDefault : equality;
  const a = array[0];
  const r = array.some((v) => !eq(a, v));
  if (r) return false;
  return true;
};

/**
 * Returns the _intersection_ of two arrays: the elements that are in common.
 * 
 * ```js
 * intersection([1, 2, 3], [2, 4, 6]);
// returns [2]
 * ```
 * See also: 
 * * {@link unique}: Unique set of items amongst one or more arrays
 * @param a1 
 * @param a2 
 * @param equality 
 * @returns 
 */
export const intersection = <V>(
  a1: ReadonlyArray<V> | ReadonlyArray<V>,
  a2: ReadonlyArray<V> | ReadonlyArray<V>,
  equality: IsEqual<V> = isEqualDefault
) => a1.filter((e1) => a2.some((e2) => equality(e1, e2)));

/**
 * Returns a 'flattened' copy of array, un-nesting arrays one level
 * ```js
 * flatten([1, [2, 3], [[4]]] ]);
 * // Yields: [ 1, 2, 3, [4]];
 * ```
 * @param array
 * @returns
 */
export const flatten = <V>(array: ReadonlyArray<V | readonly V[]>): V[] =>
  Array.prototype.concat.apply([], [...array]);

/**
 * Zip ombines the elements of two or more arrays based on their index.
 *
 * ```js
 * import { zip } from 'https://unpkg.com/ixfx/dist/arrays.js';
 *
 * const a = [1,2,3];
 * const b = [`red`, `blue`, `green`];
 *
 * const c = zip(a, b);
 * // Yields:
 * // [
 * //   [1, `red`],
 * //   [2, `blue`],
 * //   [3, `green`]
 * // ]
 * ```
 *
 * Typically the arrays you zip together are all about the same logical item. Eg, in the above example
 * perhaps `a` is size and `b` is colour. So thing #1 (at array index 0) is a red thing of size 1. Before
 * zipping we'd access it by `a[0]` and `b[0]`. After zipping, we'd have c[0], which is array of [1, `red`].
 * @param arrays
 * @returns Zipped together array
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const zip = (
  ...arrays: ReadonlyArray<any> | ReadonlyArray<any>
): Array<any> => {
  // Unit tested
  if (arrays.some((a) => !Array.isArray(a))) {
    throw new Error(`All parameters must be an array`);
  }
  const lengths = arrays.map((a) => a.length);
  if (!valuesEqual(lengths)) {
    throw new Error(`Arrays must be of same length`);
  }
  const ret = [];
  const len = lengths[0];
  //eslint-disable-next-line functional/no-let
  for (let i = 0; i < len; i++) {
    //eslint-disable-next-line functional/immutable-data
    ret.push(arrays.map((a) => a[i]));
  }
  return ret;
};

/**
 * Returns an interleaving of two or more arrays. All arrays must be the same length.
 *
 * ```js
 * import { interleave } from 'https://unpkg.com/ixfx/dist/arrays.js';
 *
 * const a = [`a`, `b`, `c`];
 * const b = [`1`, `2`, `3`];
 * const c = interleave(a, b);
 * // Yields:
 * // [`a`, `1`, `b`, `2`, `c`, `3`]
 * ```
 * @param arrays
 * @returns
 */
export const interleave = <V>(
  ...arrays: ReadonlyArray<readonly V[]> | ReadonlyArray<readonly V[]>
): Array<V> => {
  if (arrays.some((a) => !Array.isArray(a))) {
    throw new Error(`All parameters must be an array`);
  }
  const lengths = arrays.map((a) => a.length);
  if (!valuesEqual(lengths)) {
    throw new Error(`Arrays must be of same length`);
  }

  const ret = [];
  const len = lengths[0];
  //eslint-disable-next-line functional/no-let
  for (let i = 0; i < len; i++) {
    //eslint-disable-next-line functional/no-let
    for (let p = 0; p < arrays.length; p++) {
      //eslint-disable-next-line functional/immutable-data
      ret.push(arrays[p][i]);
    }
  }
  return ret;
};

/**
 * Returns an copy of `data` with specified length.
 * If the input array is too long, it is truncated.
 *
 * If the input array is too short, it will be expanded based on the `expand` strategy:
 *  - 'undefined': fill with `undefined`
 *  - 'repeat': repeat array elements, starting from position 0
 *  - 'first': continually use first element
 *  - 'last': continually use last element
 *
 * ```js
 * import { ensureLength } from 'https://unpkg.com/ixfx/dist/arrays.js';
 *
 * ensureLength([1,2,3], 2); // [1,2]
 * ensureLength([1,2,3], 5, `undefined`); // [1,2,3,undefined,undefined]
 * ensureLength([1,2,3], 5, `repeat`);    // [1,2,3,1,2]
 * ensureLength([1,2,3], 5, `first`);     // [1,2,3,1,1]
 * ensureLength([1,2,3], 5, `last`);      // [1,2,3,3,3]
 * ```
 * @param data Input array to expand
 * @param length Desired length
 * @param expand Expand strategy
 * @typeParam V Type of array
 */
export const ensureLength = <V>(
  data: ReadonlyArray<V> | ReadonlyArray<V>,
  length: number,
  expand: `undefined` | `repeat` | `first` | `last` = `undefined`
): Array<V> => {
  // Unit tested
  if (data === undefined) throw new Error(`Data undefined`);
  if (!Array.isArray(data)) throw new Error(`data is not an array`);
  if (data.length === length) return [...data];
  if (data.length > length) {
    return data.slice(0, length);
  }
  const d = [...data];
  const add = length - d.length;

  //eslint-disable-next-line functional/no-let
  for (let i = 0; i < add; i++) {
    //eslint-disable-next-line functional/immutable-data
    if (expand === `undefined`) {
      // @ts-ignore
      //eslint-disable-next-line functional/immutable-data
      d.push(undefined);
    } else if (expand === `repeat`) {
      //eslint-disable-next-line functional/immutable-data
      d.push(data[i % data.length]);
    } else if (expand === `first`) {
      //eslint-disable-next-line functional/immutable-data
      d.push(data[0]);
    } else if (expand === `last`) {
      //eslint-disable-next-line functional/immutable-data
      d.push(data[data.length - 1]);
    }
  }
  return d;
};

/**
 * Return elements from `array` that match a given `predicate`, and moreover are between
 * the given `startIndex` and `endIndex` (both inclusive).
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
 * @param endIndex End index (defaults to last index)
 */
export const filterBetween = <V>(
  array: ReadonlyArray<V> | ReadonlyArray<V>,
  predicate: (
    value: V,
    index: number,
    array: ReadonlyArray<V> | ReadonlyArray<V>
  ) => boolean,
  startIndex?: number,
  endIndex?: number
): V[] => {
  guardArray(array);
  if (typeof startIndex === `undefined`) startIndex = 0;
  if (typeof endIndex === `undefined`) endIndex = array.length - 1;
  guardIndex(array, startIndex, `startIndex`);
  guardIndex(array, endIndex, `endIndex`);

  const t: V[] = [];

  //eslint-disable-next-line functional/no-let
  for (let i = startIndex; i <= endIndex; i++) {
    //eslint-disable-next-line functional/immutable-data
    if (predicate(array[i], i, array)) t.push(array[i]);
  }
  return t;
};
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
  rand: RandomSource = defaultRandom
): number => Math.floor(rand() * array.length);

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
  rand: RandomSource = defaultRandom
): V => {
  guardArray(array, `array`);
  return array[Math.floor(rand() * array.length)];
};

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
  array: readonly V[] | ReadonlyArray<V>,
  mutate = false,
  rand: RandomSource = defaultRandom
): { readonly value: V | undefined; readonly array: Array<V> } => {
  if (array === undefined) throw new Error(`array is undefined`);
  if (!Array.isArray(array)) throw new Error(`'array' param is not an array`);
  if (array.length === 0) return { value: undefined, array: [] };
  const index = randomIndex(array, rand);
  if (mutate) {
    return {
      value: array[index],
      //eslint-disable-next-line functional/immutable-data
      array: array.splice(index, 1),
    };
  } else {
    // Copy array, remove item from that
    const t = [...array];
    //eslint-disable-next-line functional/immutable-data
    t.splice(index, 1);
    return {
      value: array[index],
      array: t,
    };
  }
};

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
  dataToShuffle: ReadonlyArray<V> | ReadonlyArray<V>,
  rand: RandomSource = defaultRandom
): Array<V> => {
  const array = [...dataToShuffle];
  // eslint-disable-next-line  functional/no-let
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

/**
 * Sorts an array of objects in ascending order
 * by the given property name, assuming it is a number.
 *
 * ```js
 * const data = [
 *  { size: 10, colour: `red` },
 *  { size: 20, colour: `blue` },
 *  { size: 5, colour: `pink` }
 * ];
 * const sorted = Arrays.sortByNumericProperty(data, `size`);
 *
 * Yields items ascending order:
 * [ { size: 5, colour: `pink` }, { size: 10, colour: `red` }, { size: 20, colour: `blue` } ]
 * ```
 * @param data
 * @param propertyName
 */
export const sortByNumericProperty = <V, K extends keyof V>(
  data: ReadonlyArray<V> | ReadonlyArray<V>,
  propertyName: K
) =>
  [...data].sort((a, b) => {
    guardArray(data, `data`);
    const av = a[propertyName];
    const bv = b[propertyName];
    if (av < bv) return -1;
    if (av > bv) return 1;
    return 0;
  });

/**
 * Returns an array with a value omitted. If value is not found, result will be a copy of input.
 * Value checking is completed via the provided `comparer` function.
 * By default checking whether `a === b`. To compare based on value, use the `isEqualValueDefault` comparer.
 *
 * @example
 * ```js
 * import { without } from 'https://unpkg.com/ixfx/dist/arrays.js';
 *
 * const data = [100, 20, 40];
 * const filtered = without(data, 20); // [100, 40]
 * ```
 *
 * @example Using value-based comparison
 * ```js
 * import { without } from 'https://unpkg.com/ixfx/dist/arrays.js';
 *
 * const data = [{name: `Alice`}, {name:`Sam`}];
 *
 * // This wouldn't work as expected, because the default comparer uses instance,
 * // not value:
 * without(data, {name: `Alice`});
 *
 * // So instead we can use a value comparer:
 * without(data, {name:`Alice`}, isEqualValueDefault);
 * ```
 *
 * @example Use a function
 * ```js
 * import { without } from 'https://unpkg.com/ixfx/dist/arrays.js';
 *
 * const data = [{name: `Alice`}, {name:`Sam`}];
 * without(data, {name:`ALICE`}, (a, b) => {
 *  return (a.name.toLowerCase() === b.name.toLowerCase());
 * });
 * ```
 *
 * Consider {@link remove} to remove an item by index.
 *
 * @template V Type of array items
 * @param data Source array
 * @param value Value to remove
 * @param comparer Comparison function. If not provided `Util.isEqualDefault` is used, which compares using `===`
 * @return Copy of array without value.
 */
export const without = <V>(
  //eslint-disable-next-line functional/prefer-readonly-type
  data: ReadonlyArray<V> | Array<V>,
  value: V,
  comparer: IsEqual<V> = isEqualDefault
): Array<V> => data.filter((v) => !comparer(v, value));

/**
 * Returns all items in `data` for as long as `predicate` returns true.
 *
 * `predicate` returns an array of `[stop:boolean, acc:A]`. The first value
 * is _true_ when the iteration should stop, and the `acc` is the accumulated value.
 * This allows `until` to be used to carry over some state from item to item.
 *
 * @example Stop when we hit an item with value of 3
 * ```js
 * const v = Arrays.until([1,2,3,4,5], v => [v === 3, 0]);
 * // [ 1, 2 ]
 * ```
 *
 * @example Stop when we reach a total
 * ```js
 * // Stop when accumulated value reaches 6
 * const v = Arrays.until[1,2,3,4,5], (v, acc) => [acc >= 7, v+acc], 0);
 * // [1, 2, 3]
 * ```
 * @param data
 * @param predicate
 * @returns
 */
export const until = <V, A>(
  //eslint-disable-next-line functional/prefer-readonly-type
  data: ReadonlyArray<V> | Array<V>,
  predicate: (v: V, acc: A) => readonly [stop: boolean, acc: A],
  initial: A
): V[] => {
  const ret = [];
  //eslint-disable-next-line functional/no-let
  let total = initial;
  //eslint-disable-next-line functional/no-let
  for (let i = 0; i < data.length; i++) {
    const [stop, acc] = predicate(data[i], total);
    if (stop) break;

    total = acc;

    //eslint-disable-next-line functional/immutable-data
    ret.push(data[i]);
  }
  return ret;
};

/**
 * Removes an element at `index` index from `data`, returning the resulting array without modifying the original.
 *
 * ```js
 * import { remove } from 'https://unpkg.com/ixfx/dist/arrays.js';
 *
 * const v = [ 100, 20, 50 ];
 * const vv = remove(2);
 *
 * Yields:
 *  v: [ 100, 20, 50 ]
 * vv: [ 100, 20 ]
 * ```
 *
 * Consider {@link without} if you want to remove an item by value.
 *
 * Throws an exception if `index` is outside the range of `data` array.
 * @param data Input array
 * @param index Index to remove
 * @typeParam V Type of array
 * @returns
 */
export const remove = <V>(
  //eslint-disable-next-line functional/prefer-readonly-type
  data: ReadonlyArray<V> | Array<V>,
  index: number
): Array<V> => {
  // ✔️ Unit tested
  if (!Array.isArray(data)) {
    throw new Error(`'data' parameter should be an array`);
  }
  guardIndex(data, index, `index`);
  return [...data.slice(0, index), ...data.slice(index + 1)];
};

/**
 * Groups data by a function `grouper`, returning data as a map with string
 * keys and array values. Multiple values can be assigned to the same group.
 *
 * `grouper` must yield a string designated group for a given item.
 *
 * @example
 * ```js
 * import { groupBy } from 'https://unpkg.com/ixfx/dist/arrays.js';
 *
 * const data = [
 *  { age: 39, city: `London` }
 *  { age: 14, city: `Copenhagen` }
 *  { age: 23, city: `Stockholm` }
 *  { age: 56, city: `London` }
 * ];
 *
 * // Whatever the function returns will be the designated group
 * // for an item
 * const map = groupBy(data, item => data.city);
 * ```
 *
 * This yields a Map with keys London, Stockholm and Copenhagen, and the corresponding values.
 *
 * ```
 * London: [{ age: 39, city: `London` }, { age: 56, city: `London` }]
 * Stockhom: [{ age: 23, city: `Stockholm` }]
 * Copenhagen: [{ age: 14, city: `Copenhagen` }]
 * ```
 * @param array Array to group
 * @param grouper Function that returns a key for a given item
 * @typeParam K Type of key to group by. Typically string.
 * @typeParam V Type of values
 * @returns Map
 */
export const groupBy = <K, V>(
  //eslint-disable-next-line functional/prefer-readonly-type
  array: Iterable<V>,
  grouper: (item: V) => K
) => {
  const map = new Map<K, V[]>();

  for (const a of array) {
    const key = grouper(a);
    //eslint-disable-next-line functional/no-let
    let existing = map.get(key);
    if (!existing) {
      existing = [];
      map.set(key, existing);
    }
    //eslint-disable-next-line functional/immutable-data
    existing.push(a);
  }
  return map;
};

/**
 * Samples array
 *
 * @example By percentage - get half of the items
 * ```
 * import { sample } from 'https://unpkg.com/ixfx/dist/arrays.js';
 *
 * const list = [1,2,3,4,5,6,7,8,9,10];
 * const sub = sample(list, 0.5);
 * // Yields: [2, 4, 6, 8, 10]
 * ```
 *
 * @example By steps - every third
 * ```
 * import { sample } from 'https://unpkg.com/ixfx/dist/arrays.js';
 *
 * const list = [1,2,3,4,5,6,7,8,9,10];
 * const sub = sample(list, 3);
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

  guardInteger(subsampleSteps, `positive`, `amount`);
  if (subsampleSteps > array.length - 1) {
    throw new Error(`Subsample steps exceeds array length`);
  }
  const r: V[] = [];

  //eslint-disable-next-line functional/no-let
  for (let i = subsampleSteps - 1; i < array.length; i += subsampleSteps) {
    //eslint-disable-next-line functional/immutable-data
    r.push(array[i]);
  }
  return r;
};

/**
 * Return `arr` broken up into chunks of `size`
 *
 * ```js
 * chunks([1,2,3,4,5,6,7,8,9,10], 3);
 * // Yields: [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
 * ```
 * @param arr
 * @param size
 * @returns
 */
//eslint-disable-next-line func-style
export function chunks<V>(
  arr: ReadonlyArray<V> | ReadonlyArray<V>,
  size: number
) {
  // https://surma.github.io/underdash/
  const output = [];
  //eslint-disable-next-line  functional/no-let
  for (let i = 0; i < arr.length; i += size) {
    //eslint-disable-next-line functional/immutable-data
    output.push(arr.slice(i, i + size));
  }
  return output;
}

/**
 * Returns a result of a merged into b.
 * B is always the 'newer' data that takes
 * precedence.
 */
export type MergeReconcile<V> = (a: V, b: V) => V;

/**
 * Merges arrays left to right, using the provided
 * `reconcile` function to choose a winner when keys overlap.
 *
 * There's also [Maps.mergeByKey](functions/Collections.Maps.mergeByKey.html) if the input data is in Map form.
 *
 * For example, if we have the array A:
 * [`A-1`, `A-2`, `A-3`]
 *
 * And array B:
 * [`B-1`, `B-2`, `B-4`]
 *
 * And with the key function:
 * ```js
 * // Make a key for value based on last char
 * const keyFn = (v) => v.substr(-1, 1);
 * ```
 *
 * If they are merged with the reconile function:
 * ```js
 * const reconcile = (a, b) => b.replace(`-`, `!`);
 * const output = mergeByKey(keyFn, reconcile, arrayA, arrayB);
 * ```
 *
 * The final result will be:
 *
 * [`B!1`, `B!2`, `A-3`, `B-4`]
 *
 * In this toy example, it's obvious how the reconciler transforms
 * data where the keys overlap. For the keys that do not overlap -
 * 3 and 4 in this example - they are copied unaltered.
 *
 * A practical use for `mergeByKey` has been in smoothing keypoints
 * from a TensorFlow pose. In this case, we want to smooth new keypoints
 * with older keypoints. But if a keypoint is not present, for it to be
 * passed through.
 *
 * @param keyFn Function to generate a unique key for data
 * @param reconcile Returns value to decide 'winner' when keys conflict.
 * @param arrays Arrays of data to merge
 */
export const mergeByKey = <V>(
  keyFn: ToString<V>,
  reconcile: MergeReconcile<V>,
  ...arrays: readonly ReadonlyArray<V>[]
): Array<V> => {
  const result = new Map<string, V>();
  for (const m of arrays) {
    for (const mv of m) {
      if (mv === undefined) continue;
      const mk = keyFn(mv);
      //eslint-disable-next-line functional/no-let
      let v = result.get(mk);
      if (v) {
        v = reconcile(v, mv);
      } else {
        v = mv;
      }
      result.set(mk, v);
    }
  }
  return [...result.values()];
};

/**
 * Reduces in a pairwise fashion.
 *
 * Eg, if we have input array of [1, 2, 3, 4, 5], the
 * `reducer` fn will run with 1,2 as parameters, then 2,3, then 3,4 etc.
 * ```js
 * const values = [1, 2, 3, 4, 5]
 * reducePairwise(values, (acc, a, b) => {
 *  return acc + (b - a);
 * }, 0);
 * ```
 *
 * If input array has less than two elements, the initial value is returned.
 *
 * ```js
 * const reducer = (acc:string, a:string, b:string) => acc + `[${a}-${b}]`;
 * const result = reducePairwise(`a b c d e f g`.split(` `), reducer, `!`);
 * Yields: `![a-b][b-c][c-d][d-e][e-f][f-g]`
 * ```
 * @param arr
 * @param reducer
 * @param initial
 * @returns
 */
export const reducePairwise = <V, X>(
  arr: readonly V[] | ReadonlyArray<V>,
  reducer: (acc: X, a: V, b: V) => X,
  initial: X
) => {
  guardArray(arr, `arr`);
  if (arr.length < 2) return initial;
  //eslint-disable-next-line functional/no-let
  for (let i = 0; i < arr.length - 1; i++) {
    initial = reducer(initial, arr[i], arr[i + 1]);
  }
  return initial;
};

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
  data: readonly V[] | ReadonlyArray<V>,
  filter: (a: V) => boolean
): [a: V[], b: V[]] => {
  const a: V[] = [];
  const b: V[] = [];
  for (let i = 0; i < data.length; i++) {
    //eslint-disable-next-line functional/immutable-data
    if (filter(data[i]!)) a.push(data[i]!);
    //eslint-disable-next-line functional/immutable-data
    else b.push(data[i]!);
  }
  return [a, b];
};

/**
 * Combines the values of one or more arrays, removing duplicates
 * ```js
 * const v = Arrays.unique([ [1, 2, 3, 4], [ 3, 4, 5, 6] ]);
 * // [ 1, 2, 3, 4, 5, 6]
 * ```
 * See also:
 * * {@link intersection}: Overlap between two arrays
 * @param arrays
 * @param comparer
 * @returns
 */
export const unique = <V>(
  //eslint-disable-next-line functional/prefer-readonly-type
  arrays: Array<Array<V>>,
  comparer = isEqualDefault
): V[] => {
  //eslint-disable-next-line functional/no-let
  let t: V[] = [];
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i];
    t = pushUnique<V>(t, a, comparer);
  }
  return t;
};

/**
 * Compares the values of two arrays, returning a list
 * of items they have in common, and those unique in `a` or `b`.
 *
 * ```js
 * const a = ['apples', 'oranges', 'pears' ]
 * const b = ['pears', 'kiwis', 'bananas' ];
 *
 * const r = compareValues(a, b);
 * r.shared;  // [ 'pears' ]
 * r.a;       // [ 'apples', 'oranges' ]
 * r.b;       // [ 'kiwis', 'bananas' ]
 * @param a
 * @param b
 * @param eq
 * @returns
 */
export const compareValues = <V>(
  a: ArrayLike<V>,
  b: ArrayLike<V>,
  eq = isEqualDefault<V>
) => {
  const shared = [];
  const aUnique = [];
  const bUnique = [];

  for (let i = 0; i < a.length; i++) {
    //eslint-disable-next-line functional/no-let
    let seenInB = false;
    for (let x = 0; x < b.length; x++) {
      if (eq(a[i], b[x])) {
        seenInB = true;
        break;
      }
    }
    if (seenInB) {
      //eslint-disable-next-line functional/immutable-data
      shared.push(a[i]);
    } else {
      //eslint-disable-next-line functional/immutable-data
      aUnique.push(a[i]);
    }
  }

  for (let i = 0; i < b.length; i++) {
    //eslint-disable-next-line functional/no-let
    let seenInA = false;
    for (let x = 0; x < a.length; x++) {
      if (eq(b[i], a[x])) {
        seenInA = true;
      }
    }
    if (!seenInA) {
      //eslint-disable-next-line functional/immutable-data
      bUnique.push(b[i]);
    }
  }

  return {
    shared,
    a: aUnique,
    b: bUnique,
  };
};

/**
 * Returns _true_ if all values in `arrays` are equal, regardless
 * of their position. Use === checking by default.
 * ```js
 * const a = ['apples','oranges','pears'];
 * const b = ['pears','oranges','apples'];
 * compareValuesEqual(a, b); // True
 * ```
 *
 * ```js
 * const a = [ { name: 'John' }];
 * const b = [ { name: 'John' }];
 * // Use a custom equality checker
 * compareValuesEqual(a, b, (aa,bb) => aa.name === bb.name);
 * ```
 * @param arrays
 * @param eq
 */
export const compareValuesEqual = <V>(
  //eslint-disable-next-line functional/prefer-readonly-type
  a: ArrayLike<V>,
  b: ArrayLike<V>,
  eq = isEqualDefault<V>
): boolean => {
  const ret = compareValues(a, b, eq);
  return ret.a.length === 0 && ret.b.length === 0;
};

/**
 * Returns _true_ if contents of `needles` is contained by `haystack`.
 * ```js
 * const a = ['apples','oranges','pears','mandarins'];
 * const b = ['pears', 'apples'];
 * contains(a, b); // True
 *
 * const c = ['pears', 'bananas'];
 * contains(a, b); // False ('bananas' does not exist in a)
 * ```
 * @param haystack
 * @param needles
 * @param eq
 */
export const contains = <V>(
  haystack: ArrayLike<V>,
  needles: ArrayLike<V>,
  eq = isEqualDefault<V>
) => {
  if (!Array.isArray(haystack)) {
    throw new Error(`Expects haystack parameter to be an array`);
  }
  if (!Array.isArray(needles)) {
    throw new Error(`Expects needles parameter to be an array`);
  }

  for (let i = 0; i < needles.length; i++) {
    //eslint-disable-next-line functional/no-let
    let found = false;
    for (let x = 0; x < haystack.length; x++) {
      if (eq(needles[i], haystack[x])) {
        found = true;
        break;
      }
    }
    if (!found) {
      return false;
    }
  }
  return true;
};
