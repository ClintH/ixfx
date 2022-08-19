/**
 * Functions for working with primitive arrays, regardless of type
 * See Also: NumericArrays.ts
 */

import {integer as guardInteger} from '../Guards.js';
import {defaultRandom, RandomSource} from '../Random.js';
import {IsEqual, isEqualDefault, isEqualValueDefault} from '../Util.js';

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
export const guardArray = <V>(array:ArrayLike<V>, paramName:string = `?`) => {
  if (array === undefined) throw new Error(`Param '${paramName}' is undefined. Expected array.`);
  if (array === null) throw new Error(`Param '${paramName}' is null. Expected array.`);
  if (!Array.isArray(array)) throw new Error(`Param '${paramName}' not an array as expected`);
};

/**
 * Throws if `index` is an invalid array index for `array`, and if
 * `array` itself is not a valid array.
 * @param array 
 * @param index 
 */
export const guardIndex = <V>(array:ReadonlyArray<V>, index:number, paramName:string = `index`) => {
  guardArray(array);
  guardInteger(index, `positive`, paramName);
  if (index > array.length -1) throw new Error(`'${paramName}' ${index} beyond array max of ${array.length-1}`);
};

/**
 * Returns _true_ if all the contents of the array are identical.
 * 
 * @example Uses default equality function:
 * ```js
 * import { areValuesIdentical } from 'https://unpkg.com/ixfx/dist/arrays.js';
 * 
 * const a1 = [10, 10, 10];
 * areValuesIdentical(a1); // True
 * 
 * const a2 = [ {name:`Jane`}, {name:`John} ];
 * areValuesIdentical(a2); // True, because JSON version captures value
 * ```
 * 
 * If we want to compare by value for objects that aren't readily
 * converted to JSON, you need to provide a function:
 * 
 * ```js
 * areValuesIdentical(someArray, (a, b) => {
 *  return (a.eventType === b.eventType);
 * });
 * ```
 * @param array Array
 * @param equality Equality checker. Uses string-conversion checking by default
 * @returns 
 */
export const areValuesIdentical = <V>(array:ReadonlyArray<V>, equality?:IsEqual<V>):boolean => {
  // Unit tested

  if (!Array.isArray(array)) throw new Error(`Param 'array' is not an array.`);
  if (array.length === 0) return true;
  const eq = (equality === undefined) ? isEqualValueDefault : equality;
  const a = array[0];
  const r = array.some(v => !eq(a, v));
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
 * @param a1 
 * @param a2 
 * @param equality 
 * @returns 
 */
export const intersection = <V>(a1:ReadonlyArray<V>, a2:ReadonlyArray<V>, equality:IsEqual<V> = isEqualDefault) => a1.filter(e1 => a2.some(e2 => equality(e1, e2)));

/**
 * Returns a 'flattened' copy of array, un-nesting arrays one level
 * ```js
 * flatten([1, [2, 3], [[4]]] ]);
 * // Yields: [ 1, 2, 3, [4]];
 * ```
 * @param array 
 * @returns 
 */
export const flatten = <V>(array:ReadonlyArray<V|readonly V[]>):readonly V[] => Array.prototype.concat.apply([], [...array]);


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
export const zip = (...arrays:ReadonlyArray<any>):ReadonlyArray<any> => {
  // Unit tested
  if (arrays.some((a) => !Array.isArray(a))) throw new Error(`All parameters must be an array`);
  const lengths = arrays.map(a => a.length);
  if (!areValuesIdentical(lengths)) throw new Error(`Arrays must be of same length`);
  const ret = [];
  const len = lengths[0];
  //eslint-disable-next-line functional/no-let
  for (let i=0;i<len;i++) {
    //eslint-disable-next-line functional/immutable-data
    ret.push(arrays.map(a => a[i]));
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
export const interleave = <V>(...arrays:ReadonlyArray<readonly V[]>):ReadonlyArray<V> => {
  if (arrays.some((a) => !Array.isArray(a))) throw new Error(`All parameters must be an array`);
  const lengths = arrays.map(a => a.length);
  if (!areValuesIdentical(lengths)) throw new Error(`Arrays must be of same length`);

  const ret = [];
  const len = lengths[0];
  //eslint-disable-next-line functional/no-let
  for (let i=0;i<len;i++) {
    //eslint-disable-next-line functional/no-let
    for (let p=0;p<arrays.length;p++) {
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
export const ensureLength = <V>(data:ReadonlyArray<V>, length:number, expand:`undefined`|`repeat`|`first`|`last` = `undefined`):ReadonlyArray<V> => {
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
  for (let i=0;i<add;i++) {
    //eslint-disable-next-line functional/immutable-data
    if (expand === `undefined`) {
      //eslint-disable-next-line functional/immutable-data
      d.push(undefined);
    } else if (expand === `repeat`) {
      //eslint-disable-next-line functional/immutable-data
      d.push(data[i%data.length]);
    } else if (expand === `first`) {
      //eslint-disable-next-line functional/immutable-data
      d.push(data[0]);
    } else if (expand === `last`) {
      //eslint-disable-next-line functional/immutable-data
      d.push(data[data.length-1]);
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
export const filterBetween = <V>(array:ReadonlyArray<V>, predicate: (value: V, index: number, array: ReadonlyArray<V>) => boolean, startIndex?:number, endIndex?:number):readonly V[] => {
  guardArray(array);
  if (typeof startIndex === `undefined`) startIndex = 0;
  if (typeof endIndex === `undefined`) endIndex = array.length-1;
  guardIndex(array, startIndex, `startIndex`);
  guardIndex(array, endIndex, `endIndex`);

  const t:V[] = [];
  
  //eslint-disable-next-line functional/no-let
  for (let i=startIndex;i<=endIndex;i++) {
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
export const randomIndex = <V>(array: ArrayLike<V>, rand:RandomSource = defaultRandom): number => Math.floor(rand() * array.length);

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
export const randomElement = <V>(array: ArrayLike<V>, rand:RandomSource = defaultRandom): V => {
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
//eslint-disable-next-line functional/prefer-readonly-type
export const randomPluck = <V>(array:readonly V[], mutate = false, rand:RandomSource = defaultRandom):{readonly value:V|undefined, readonly array:Array<V> } => {
  if (array === undefined) throw new Error(`array is undefined`);
  if (!Array.isArray(array)) throw new Error(`'array' param is not an array`);
  if (array.length === 0) return {value: undefined, array: []};
  const index = randomIndex(array, rand);
  if (mutate) {
    return {
      value: array[index],
      //eslint-disable-next-line functional/immutable-data
      array: array.splice(index, 1)
    };
  } else {
    // Copy array, remove item from that
    const t = [...array];
    //eslint-disable-next-line functional/immutable-data
    t.splice(index, 1);
    return {
      value: array[index],
      array: t
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
export const shuffle = <V>(dataToShuffle:ReadonlyArray<V>, rand:RandomSource = defaultRandom): ReadonlyArray<V> => {
  const array = [...dataToShuffle];
  // eslint-disable-next-line  functional/no-let
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

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
export const without = <V>(data:ReadonlyArray<V>, value:V, comparer:IsEqual<V> = isEqualDefault):ReadonlyArray<V> => data.filter(v => !comparer(v, value));

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
export const remove = <V>(data:ReadonlyArray<V>, index:number) : ReadonlyArray<V> => {
  // ✔️ Unit tested
  if (!Array.isArray(data)) throw new Error(`'data' parameter should be an array`);
  guardIndex(data, index, `index`);
  return [...data.slice(0, index), ...data.slice(index+1)]; 
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
export const groupBy = <K, V>(array: ReadonlyArray<V>, grouper: (item: V) => K) => array.reduce((store, item) => {
  const key = grouper(item);
  const val = store.get(key);
  if (val === undefined) {
    store.set(key, [item]);
  } else {
    // eslint-disable-next-line functional/immutable-data
    val.push(item);
  }
  return store;
  /* eslint-disable-next-line functional/prefer-readonly-type */
}, new Map<K, V[]>());

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
export const sample = <V>(array: ReadonlyArray<V>, amount:number):ReadonlyArray<V> => {
  //eslint-disable-next-line functional/no-let
  let subsampleSteps = 1;
  if (amount <= 1) {
    // Subsample based on a percentage
    const numberOfItems = array.length*amount;
    subsampleSteps = Math.round(array.length/numberOfItems);
  } else {
    subsampleSteps = amount;
  }

  guardInteger(subsampleSteps, `positive`, `amount`);
  if (subsampleSteps > array.length -1) throw new Error(`Subsample steps exceeds array length`);
  
  const r:V[] = [];
  
  //eslint-disable-next-line functional/no-let
  for (let i=subsampleSteps-1;i<array.length;i+=subsampleSteps) {
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
export function chunks<V>(arr:ReadonlyArray<V>, size:number) {
  // https://surma.github.io/underdash/
  const output = [];
  //eslint-disable-next-line  functional/no-let
  for (let i = 0; i < arr.length; i += size) {
    //eslint-disable-next-line functional/immutable-data
    output.push(arr.slice(i, i + size));
  }
  return output;
}