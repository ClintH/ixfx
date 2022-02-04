/**
 * Functions for working with primitive arrays, regardless of type
 * See Also: NumericArrays.ts
 */

import {IsEqual, isEqualDefault} from '../util.js';

export * from './NumericArrays.js';

/**
 * Throws an error if `array` parameter is not a valid array
 * @param array 
 * @param paramName 
 */
export const guardArray = <V>(array:ArrayLike<V>, paramName:string = `?`) => {
  if (array === undefined) throw new Error(`Param '${paramName}' is undefined. Expected array.`);
  if (array === null) throw new Error(`Param '${paramName}' is null. Expected array.`);
  if (!Array.isArray(array)) throw new Error(`Param '${paramName}' not an array as expected`);
};

/**
 * Returns a random array index
 * @param array
 * @returns 
 */
export const randomIndex = <V>(array: ArrayLike<V>): number => Math.floor(Math.random() * array.length);

/**
 * Returns random element
 * @param array
 * @returns 
 */
export const randomElement = <V>(array: ArrayLike<V>): V => {
  guardArray(array, `array`);
  return array[Math.floor(Math.random() * array.length)];
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
 * @return Returns an object `{value:V|undefined, array:V[]}`
 */
//eslint-disable-next-line functional/prefer-readonly-type
export const randomPluck = <V>(array:readonly V[], mutate = false):{readonly value:V|undefined, readonly array:Array<V> } => {
  if (array === undefined) throw new Error(`array is undefined`);
  if (!Array.isArray(array)) throw new Error(`'array' param is not an array`);
  if (array.length === 0) return {value: undefined, array: []};
  const index = randomIndex(array);
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
 * @returns Copy with items moved around randomly
 * @template V Type of array items
 */
export const shuffle = <V>(dataToShuffle:ReadonlyArray<V>): ReadonlyArray<V> => {
  const array = [...dataToShuffle];
  // eslint-disable-next-line functional/no-loop-statement, functional/no-let
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
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
 * 
 * // Returns a map 
 * ```js
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