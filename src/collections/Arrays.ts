/**
 * Functions for working with primitive arrays, regardless of type
 * See Also: NumericArrays.ts
 */

import {defaultRandom, RandomSource} from '../Random.js';
import {IsEqual, isEqualDefault, isEqualValueDefault} from '../Util.js';

export * from './NumericArrays.js';

/**
 * Throws an error if `array` parameter is not a valid array
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
 * Returns _true_ if all the contents of the array are identical
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
 * Zip ombines the elements of two or more arrays based on their index.
 * 
 * ```js
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
  //eslint-disable-next-line functional/no-loop-statement,functional/no-let
  for (let i=0;i<len;i++) {
    //eslint-disable-next-line functional/immutable-data
    ret.push(arrays.map(a => a[i]));
  }
  return ret;
};

/**
 * Returns an copy of `data` with specified length.
 * If the input array is too long, it is truncated. 
 * If the input array is too short, it will the expanded based on the `expand` strategy
 *  - undefined: fill with `undefined`
 *  - repeat: repeat array elements from position 0
 *  - first: continually use first element
 *  - last: continually use last element
 * 
 * ```js
 * ensureLength([1,2,3], 2); // [1,2]
 * ensureLength([1,2,3], 5, `undefined`); // [1,2,3,undefined,undefined]
 * ensureLength([1,2,3], 5, `repeat`);    // [1,2,3,1,2]
 * ensureLength([1,2,3], 5, `first`);     // [1,2,3,1,1]
 * ensureLength([1,2,3], 5, `last`);      // [1,2,3,3,3] 
 * ```
 * @param data 
 * @param length 
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
  
  //eslint-disable-next-line functional/no-loop-statement,functional/no-let
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
 * Returns a random array index
 * @param array
 * @param rand Random generator. `Math.random` by default.
 * @returns 
 */
export const randomIndex = <V>(array: ArrayLike<V>, rand:RandomSource = defaultRandom): number => Math.floor(rand() * array.length);

/**
 * Returns random element
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
 * const data = [100, 20, 40];
 * const {value, array} = randomPluck(data);
 * // value: 20, array: [100, 40], data: [100, 20, 40];
 * ```
 *
 * @example Mutating source
 * ```js
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
  // eslint-disable-next-line functional/no-loop-statement, functional/no-let
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

/**
 * Returns an array with a value omitted. If value is not found, result will be a copy of input.
 * Value checking is completed via the provided `comparer` function, or by default checking whether `a === b`.
 *
 * @example
 * ```js
 * const data = [100, 20, 40];
 * const filtered = without(data, 20); // [100, 40]
 * ```
 * @template V Type of array items
 * @param data Source array
 * @param value Value to remove
 * @param comparer Comparison function. If not provided {@link isEqualDefault} is used, which compares using `===`
 * @return Copy of array without value.
 */
export const without = <V>(data:ReadonlyArray<V>, value:V, comparer:IsEqual<V> = isEqualDefault):ReadonlyArray<V> => data.filter(v => !comparer(v, value));

/**
 * Groups data by a grouper function, returning data as a map with string
 * keys and array values.
 * 
 * @example
 * ```js
 * const data = [
 *  { age: 39, city: `London` }
 *  { age: 14, city: `Copenhagen` }
 *  { age: 23, city: `Stockholm` }
 *  { age: 56, city: `London` }
 * ];
 * const map = groupBy(data, item => data.city); 
 * ```
 * 
 * Returns a map: 
 * ```
 * London: [{ age: 39, city: `London` }, { age: 56, city: `London` }]
 * Stockhom: [{ age: 23, city: `Stockholm` }]
 * Copenhagen: [{ age: 14, city: `Copenhagen` }]
 * ```
 * @param array Array to group
 * @param grouper Function that returns a key for a given item
 * @template K Type of key to group by. Typically string.
 * @template V Type of values
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