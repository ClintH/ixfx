import { arrayIndexTest, arrayTest, resultThrow } from "@ixfx/guards";

/**
 * Like Array.findIndex but with optional `startAt` and `length` parameters to limit the search to a specific section of the array.
 *
 * ```js
 * const data = ["red","blue","red","blue"]
 * data.findIndex(v => v === `red`); // 0 - finds first match
 * findIndex(data, v => v === `red`, 1); // 2 - finds first match after start index of 1
 * ```
 *
 * Use {@link findIndexReverse} to search backwards through the array.
 * @param array
 * @param predicate
 * @param startInclusive
 * @param endExclusive End index (exclusive). By default, uses array.length
 */
export function findIndex<V>(array: readonly V[], predicate: (value: V, index: number, obj: readonly V[]) => boolean, startInclusive?: number, endExclusive?: number): number {
  const _start = startInclusive ?? 0;
  const _end = endExclusive ?? array.length;

  if (_start >= array.length)
    throw new RangeError(`Start ${_start} is out of bounds for array of length ${array.length}`);
  if (_end > array.length)
    throw new RangeError(`End ${_end} is out of bounds for array of length ${array.length}`);
  if (_start > _end)
    throw new RangeError(`Start ${_start} is greater than end ${_end}`);

  for (let i = _start; i < _end; i++) {
    if (predicate(array[i], i, array)) {
      return i;
    }
  }
  return -1;
}

/**
 * Returns a matching index, starting at index `start` and working backwards up until `end` (both inclusive).
 * ```
 * const data = ["red","blue","red","blue","red"];
 * findIndexReverse(data, v=> v === `red`);     // 4
 * findIndexReverse(data, v=> v === `red`, 3);  // 2
 * findIndexReverse(data, v=> v === `red`, 2);  // 2
 * ```
 * @param array
 * @param predicate
 * @param startInclusive
 * @param endInclusive
 * @returns
 */
export function findIndexReverse<V>(array: readonly V[], predicate: (value: V, index: number, obj: readonly V[]) => boolean, startInclusive?: number, endInclusive?: number): number {
  const _start = startInclusive ?? array.length - 1;
  const _end = endInclusive ?? 0;
  if (_start >= array.length)
    throw new RangeError(`Start ${_start} is out of bounds for array of length ${array.length}`);
  if (_end < 0)
    throw new RangeError(`End ${_end} is out of bounds`);
  if (_start < _end)
    throw new RangeError(`Start ${_start} is less than end ${_end}`);
  for (let i = _start; i >= _end; i--) {
    if (predicate(array[i], i, array)) {
      return i;
    }
  }
  return -1;
}

/**
 * Enumerates the index of all array values that match `predicate`.
 *
 * ```js
 * const data =  [`red`,`blue`,`red`,`blue`,`red`];
 * for (const index of filterWithIndex(data, v=> v === `red`)) {
 *  // Yields 0, 2, 4
 * }
 * ```
 * @param array
 * @param predicate
 */
export function *filterWithIndex<V>(array: readonly V[], predicate: (value: V, index: number, obj: readonly V[]) => boolean): Generator<number> {
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i, array)) {
      yield i;
    }
  }
}

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
export function filterAB<V>(data: readonly V[], filter: (a: V) => boolean): [ a: V[], b: V[] ] {
  const a: V[] = [];
  const b: V[] = [];
  for (const datum of data) {
    if (filter(datum))
      a.push(datum);
    else b.push(datum);
  }
  return [a, b];
}

/**
 * Yields elements from `array` that match a given `predicate`, and moreover are between
 * the given `startIndex` (inclusive) and `endIndex` (exclusive).
 *
 * While this can be done with in the in-built `array.filter` function, it will
 * needlessly iterate through the whole array. It also avoids another alternative
 * of slicing the array before using `filter`.
 *
 * ```js
 * // Return 'registered' people between and including array indexes 5-10
 * const filtered = [...filterBetween(people, person => person.registered, 5, 10)];
 * ```
 * @param array Array to filter
 * @param predicate Filter function
 * @param startIndex Start index (defaults to 0)
 * @param endIndex End index (by default runs until end)
 */
export function *filterBetween<V>(
  array: readonly V[] | V[],
  predicate: (
    value: V,
    index: number,
    array: readonly V[] | V[],
  ) => boolean,
  startIndex?: number,
  endIndex?: number,
): Generator<V> {
  resultThrow(arrayTest(array, `array`));
  if (typeof startIndex === `undefined`)
    startIndex = 0;
  if (typeof endIndex === `undefined`)
    endIndex = array.length; // - 1;

  resultThrow(arrayIndexTest(array, startIndex, `startIndex`));
  resultThrow(arrayIndexTest(array, endIndex - 1, `endIndex`));

  for (let index = startIndex; index < endIndex; index++) {
    if (predicate(array[index], index, array))
      yield array[index];// t.push(array[ index ]);
  }
};
