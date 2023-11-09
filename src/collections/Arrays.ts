/* eslint-disable indent */
/**
 * Functions for working with primitive arrays, regardless of type
 * See Also: NumericArrays.ts
 */

import { throwIntegerTest } from '../Guards.js';
import { defaultRandom, weightedIndex, type RandomSource } from '../Random.js';
import {
  type ToString,
  toStringDefault,
} from '../Util.js';
import {
  type IsEqual,
  isEqualDefault,
  isEqualValueDefault
} from '../IsEqual.js'
import { fromIterable as mapFromIterable } from './map/MapFns.js';
export * from './NumericArrays.js';
export { compareValues, compareValuesEqual } from './Iterables.js';

/**
 * Throws an error if `array` parameter is not a valid array
 *
 * ```js
 * import { guardArray } from 'https://unpkg.com/ixfx/dist/arrays.js';
 * guardArray(someVariable);
 * ```
 * @private
 * @param array
 * @param name
 */
export const guardArray = <V>(array: ArrayLike<V>, name = `?`) => {
  if (array === undefined) {
    throw new TypeError(`Param '${ name }' is undefined. Expected array.`);
  }
  if (array === null) {
    throw new TypeError(`Param '${ name }' is null. Expected array.`);
  }
  if (!Array.isArray(array)) {
    throw new TypeError(`Param '${ name }' not an array as expected`);
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
  name = `index`
) => {
  guardArray(array);
  throwIntegerTest(index, `positive`, name);
  if (index > array.length - 1) {
    throw new Error(
      `'${ name }' ${ index } beyond array max of ${ array.length - 1 }`
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
  const eq = equality ?? isEqualValueDefault;
  const a = array[ 0 ];
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
 * @param arrayA 
 * @param arrayB 
 * @param equality 
 * @returns 
 */
export const intersection = <V>(
  arrayA: ReadonlyArray<V> | Array<V>,
  arrayB: ReadonlyArray<V> | Array<V>,
  equality: IsEqual<V> = isEqualDefault
) => arrayA.filter((valueFromA) => arrayB.some((valueFromB) => equality(valueFromA, valueFromB)));

/**
 * Returns a 'flattened' copy of array, un-nesting arrays one level
 * ```js
 * flatten([1, [2, 3], [[4]] ]);
 * // Yields: [ 1, 2, 3, [4]];
 * ```
 * @param array
 * @returns
 */
export const flatten = (array: ReadonlyArray<any> | Array<any>): Array<any> =>
  [ ...array ].flat();


/**
 * Zip combines the elements of two or more arrays based on their index.
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
  ...arrays: Array<Array<any>> | ReadonlyArray<Array<any>> | ReadonlyArray<ReadonlyArray<any>>
): Array<any> => {
  // Unit tested
  if (arrays.some((a) => !Array.isArray(a))) {
    throw new Error(`All parameters must be an array`);
  }
  const lengths = arrays.map((a) => a.length);
  if (!valuesEqual(lengths)) {
    throw new Error(`Arrays must be of same length`);
  }

  const returnValue = [];
  const length = lengths[ 0 ];

  for (let index = 0; index < length; index++) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    returnValue.push(arrays.map((a) => a[ index ]));
  }
  return returnValue;
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
  ...arrays: ReadonlyArray<ReadonlyArray<V>> | Array<Array<V>>
): Array<V> => {
  if (arrays.some((a) => !Array.isArray(a))) {
    throw new Error(`All parameters must be an array`);
  }
  const lengths = arrays.map((a) => a.length);
  if (!valuesEqual(lengths)) {
    throw new Error(`Arrays must be of same length`);
  }

  const returnValue = [];
  const length = lengths[ 0 ];
  //eslint-disable-next-line functional/no-let
  for (let index = 0; index < length; index++) {
    //eslint-disable-next-line functional/no-let
    for (const array of arrays) {
      //eslint-disable-next-line functional/immutable-data
      returnValue.push(array[ index ]);
    }
  }
  return returnValue;
};

/**
 * Returns a copy of `data` with specified length.
 * If the input array is too long, it is truncated.
 *
 * If the input array is too short, it will be expanded based on the `expand` strategy:
 *  - 'undefined': fill with `undefined`
 *  - 'repeat': repeat array elements, starting from position 0
 *  - 'first': repeat with first element from `data`
 *  - 'last': repeat with last element from `data`
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
  data: ReadonlyArray<V> | Array<V>,
  length: number,
  expand: `undefined` | `repeat` | `first` | `last` = `undefined`
): Array<V> => {
  // Unit tested
  if (data === undefined) throw new Error(`Data undefined`);
  if (!Array.isArray(data)) throw new Error(`data is not an array`);
  if (data.length === length) return [ ...data ];
  if (data.length > length) {
    return data.slice(0, length);
  }
  const d = [ ...data ];
  const add = length - d.length;

  //eslint-disable-next-line functional/no-let
  for (let index = 0; index < add; index++) {
    //eslint-disable-next-line functional/immutable-data
    switch (expand) {
      case `undefined`: {
        // @ts-expect-error
        d.push(undefined);
        break;
      }
      case `repeat`: {
        d.push(data[ index % data.length ]);
        break;
      }
      case `first`: {
        d.push(data[ 0 ]);
        break;
      }
      case `last`: {
        // @ts-expect-error
        d.push(data.at(-1));
        break;
      }
      // No default
    }
  }
  return d;
};

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
export const randomElementWeightedSource = <V>(array: ArrayLike<V>, weightings: Array<number>, randomSource: RandomSource = defaultRandom) => {
  if (array.length !== weightings.length) throw new Error(`Lengths of 'array' and 'weightings' should be the same.`);
  const r = weightedIndex(weightings, randomSource);
  return (): V => {
    const index = r();
    return array[ index ];
  }
}




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
  return array[ Math.floor(rand() * array.length) ];
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
  array: ReadonlyArray<V> | Array<V>,
  mutate = false,
  rand: RandomSource = defaultRandom
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
  rand: RandomSource = defaultRandom
): Array<V> => {
  const array = [ ...dataToShuffle ];
  // eslint-disable-next-line  functional/no-let
  for (let index = array.length - 1; index > 0; index--) {
    const index_ = Math.floor(rand() * (index + 1));
    [ array[ index ], array[ index_ ] ] = [ array[ index_ ], array[ index ] ];
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
  data: ReadonlyArray<V> | Array<V>,
  propertyName: K
) => [ ...data ].sort((a, b) => {
  guardArray(data, `data`);
  const av = a[ propertyName ];
  const bv = b[ propertyName ];
  if (av < bv) return -1;
  if (av > bv) return 1;
  return 0;
});

/**
 * Returns an array with value(s) omitted. If value is not found, result will be a copy of input.
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

export const withoutUndefined = <V>(data: ReadonlyArray<V> | Array<V>): Array<V> => {
  return data.filter(v => v !== undefined);
}
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
  predicate: (v: V, accumulator: A) => readonly [ stop: boolean, acc: A ],
  initial: A
): Array<V> => {
  const returnValue = [];
  //eslint-disable-next-line functional/no-let
  let total = initial;
  //eslint-disable-next-line functional/no-let
  for (const datum of data) {
    const [ stop, accumulator ] = predicate(datum, total);
    if (stop) break;

    total = accumulator;

    //eslint-disable-next-line functional/immutable-data
    returnValue.push(datum);
  }
  return returnValue;
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
    throw new TypeError(`'data' parameter should be an array`);
  }
  guardIndex(data, index, `index`);
  return [ ...data.slice(0, index), ...data.slice(index + 1) ];
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
  const map = new Map<K, Array<V>>();

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
  array: ReadonlyArray<V>,
  size: number
) {
  // https://surma.github.io/underdash/
  const output = [];
  //eslint-disable-next-line  functional/no-let
  for (let index = 0; index < array.length; index += size) {
    //eslint-disable-next-line functional/immutable-data
    output.push(array.slice(index, index + size));
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
  keyFunction: ToString<V>,
  reconcile: MergeReconcile<V>,
  ...arrays: ReadonlyArray<ReadonlyArray<V>>
): Array<V> => {
  const result = new Map<string, V>();
  for (const m of arrays) {
    for (const mv of m) {
      if (mv === undefined) continue;
      const mk = keyFunction(mv);
      //eslint-disable-next-line functional/no-let
      let v = result.get(mk);
      v = v ? reconcile(v, mv) : mv;
      result.set(mk, v);
    }
  }
  return [ ...result.values() ];
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
  array: ReadonlyArray<V>,
  reducer: (accumulator: X, a: V, b: V) => X,
  initial: X
) => {
  guardArray(array, `arr`);
  if (array.length < 2) return initial;
  //eslint-disable-next-line functional/no-let
  for (let index = 0; index < array.length - 1; index++) {
    initial = reducer(initial, array[ index ], array[ index + 1 ]);
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
 * Combines the values of one or more arrays, removing duplicates
 * ```js
 * const v = Arrays.unique([ [1, 2, 3, 4], [ 3, 4, 5, 6] ]);
 * // [ 1, 2, 3, 4, 5, 6]
 * ```
 *
 * A single array can be provided as well:
 * ```js
 * const v = Arrays.unique([ 1, 2, 3, 1, 2, 3 ]);
 * // [ 1, 2, 3 ]
 * ```
 * 
 * By default uses JSON.toString() to compare values.
 * 
 * See also:
 * * {@link intersection}: Overlap between two arrays
 * * {@link additionalValues}: Yield values from an iterable not present in the other
 * * {@link containsDuplicateValues}: Returns true if array contains duplicates
 * @param arrays
 * @param comparer
 * @returns
 */
export const unique = <V>(
  arrays:
    | Array<Array<V>>
    | Array<V>
    | ReadonlyArray<V>
    | ReadonlyArray<ReadonlyArray<V>>,
  comparer = isEqualDefault<V>
): ReadonlyArray<V> => {
  const t: Array<V> = [];
  for (const a of arrays) {
    if (Array.isArray(a)) {
      for (const v of additionalValues<V>(t, a, comparer)) {
        t.push(v);
      }
    } else {
      return [ ...additionalValues<V>([], arrays as Array<V>, comparer) ];
    }
  }
  return t;
};

/**
 * Returns _true_ if array contains duplicate values.
 *
 * ```js
 * containsDuplicateValues(['a','b','a']); // True
 * containsDuplicateValues([
 *  { name: 'Apple' },
 *  { name: 'Apple' }
 * ]); // True
 * ```
 * 
 * Uses JSON.toString() by default to compare values.
 * 
 * See also:
 * * {@link containsDuplicateInstances}: Compare based on reference, rather than value
 * * {@link unique} Get unique set of values in an array
 * @param array Array to examine
 * @param comparer Comparer, uses JSON.toString by default
 * @returns
 */
export const containsDuplicateValues = <V>(
  array: Array<V> | ReadonlyArray<V>,
  keyFunction = toStringDefault<V>
): boolean => {
  if (!Array.isArray(array)) throw new Error(`Parameter needs to be an array`);
  try {
    const _ = mapFromIterable(array, keyFunction);
  } catch {
    return true;
  }
  return false;
};

/**
 * Returns _true_ if array contains duplicate instances.
 * Use {@link containsDuplicateValues} if you'd rather compare by value.
 * @param array 
 * @returns 
 */
export const containsDuplicateInstances = <V>(array: Array<V> | ReadonlyArray<V>): boolean => {
  if (!Array.isArray(array)) throw new Error(`Parameter needs to be an array`);
  for (let index = 0; index < array.length; index++) {
    for (let x = 0; x < array.length; x++) {
      if (index === x) continue;
      if (array[ index ] === array[ x ]) return true;
    }
  }
  return false;
}

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
    throw new TypeError(`Expects haystack parameter to be an array`);
  }
  if (!Array.isArray(needles)) {
    throw new TypeError(`Expects needles parameter to be an array`);
  }

  for (const needle of needles) {
    //eslint-disable-next-line functional/no-let
    let found = false;
    for (const element of haystack) {
      if (eq(needle, element)) {
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

/**
 * Yield values from an iterable not present in the other.
 *
 * Assuming that `input` array is unique values, this function
 * yields items from `values` which are not present in `input`.
 *
 * Duplicate items in `values` are ignored - only the first is yielded.
 *
 * If `eq` function is not provided, values are compared using the
 * default === semantics (via {@link isEqualDefault})
 *
 * ```js
 * const existing = [ 1, 2, 3 ];
 * const newValues = [ 3, 4, 5];
 * const v = [...additionalValues(existing, newValues)];
 * // [ 1, 2, 3, 4, 5]
 * ```
 *
 * ```js
 * const existing = [ 1, 2, 3 ];
 * const newValues = [ 3, 4, 5 ];
 * for (const v of additionalValues(existing, newValues)) {
 *  // 4, 5
 * }
 * To combine one or more iterables, keeping only unique items, use {@link unique}
 * @param input
 * @param values
 */
export function* additionalValues<V>(
  //eslint-disable-next-line functional/prefer-readonly-type
  input: Array<V>,
  //eslint-disable-next-line functional/prefer-readonly-type
  values: Iterable<V>,
  eq: IsEqual<V> = isEqualDefault
): Iterable<V> {
  // Keep track of values already yielded
  const yielded: Array<V> = [];
  for (const v of values) {
    const found = input.find((index) => eq(index, v));
    if (!found) {
      const alreadyYielded = yielded.find((ii) => eq(ii, v));
      if (!alreadyYielded) {
        //eslint-disable-next-line functional/immutable-data
        yielded.push(v);
        yield v;
      }
    }
  }
}
