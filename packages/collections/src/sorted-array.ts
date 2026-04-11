import type { Comparer } from "@ixfx/core";
import { defaultComparer } from "@ixfx/core";

/**
 * Returns an immutable wrapper around an array, initially unsorted.
 * Sorts data and passes to {@link wrapSorted}.
 * @param unsortedData
 * @param comparer
 */
export const wrapUnsorted = <T>(unsortedData: T[], comparer: Comparer<T> = defaultComparer): WrapSortedArray<T> => wrapSorted(unsortedData.toSorted(comparer));

export type WrapSortedArray<T> = {
  /**
   * Returns index of an item, or -1 if not found
   * @param sought Item to find
   * @returns
   */
  indexOf: (sought: T) => number;

  matchingRange: (sought: T) => { startIndex: number; endIndex: number } | undefined;

  /**
   * Returns the index at which the value would be inserted
   * @param toInsert
   * @returns
   */
  insertionIndex: (toInsert: T) => number;

  /**
   * Inserts an item, returning a new wrapper
   * @param toInsert
   * @returns
   */
  insert: (toInsert: T) => WrapSortedArray<T>;

  /**
   * Removes an item, returning a new wrapper
   * @param toRemove
   * @returns
   */
  remove: (toRemove: T) => WrapSortedArray<T>;

  /**
   * Gets item at a specified offset
   * @param offset
   * @returns
   */
  at: (offset: number) => T | undefined;

  /**
   * Gets length
   */
  get length(): number;

  /**
   * Gets underlying array.
   * Be careful not to mutate. Use `toArray` to get a copy
   * that can be modified.
   */
  get data(): T[];

  /**
   * Returns a copy of data which is safe to modify.
   * @returns
   */
  toArray: () => T[];
};
/**
 * Returns an immutable wrapper around a sorted array.
 * Use {@link wrapUnsorted} if not yet sorted.
 *
 * Functions that change contents return a new wrapped instance.
 *
 * ```js
 * let w = wrapSorted([ 1, 2, 10 ]);
 * w.indexOf(1);    // 0
 * w = w.insert(9); // Inserts 9, returning a new wrapper
 * w = w.remove(9); // Removes 9, returning a new wrapper
 * ```
 *
 * You can access the underyling sorted array with the `data` property.
 * It's important this is not modified since the wrapper assumes its immutable
 * and stays sorted. Use `toArray()` to get a copy of the array which can be
 * changed.
 *
 * ```js
 * // A few basic array-like features supported
 * w.length;    // Get length of array
 * w.at(0);     // Get item at index 0
 * w.data;      // Get underlying array
 * w.toArray(); // Get a copy of the underyling array
 * ```
 * @param sortedData
 * @param comparer
 * @returns Wrapped, sorted array
 */
export function wrapSorted<T>(sortedData: T[], comparer: Comparer<T> = defaultComparer): WrapSortedArray<T> {
  const store = [...sortedData];
  return {

    indexOf: (sought: T) => {
      // return indexOf(store, sought, start, end, comparer);
      return indexOf(store, sought, comparer);
    },
    insertionIndex: (toInsert: T) => {
      // return insertionIndex(store, toInsert, 0, store.length, comparer);
      return insertionIndex(store, toInsert, comparer);
    },
    insert: (toInsert: T) => {
      return wrapSorted(insert(store, toInsert, comparer), comparer);
    },
    matchingRange: (sought: T): { startIndex: number; endIndex: number } | undefined => {
      return matchingRange(store, sought, comparer);
    },
    remove: (toRemove: T) => {
      return wrapSorted(remove(store, toRemove, comparer));
    },

    at: (offset: number) => {
      return store.at(offset);
    },
    get length() {
      return store.length;
    },
    get data() {
      return store;
    },

    toArray: () => {
      return [...store];
    },
  };
}

/**
 * Returns first index of data in an ascended sorted array using a binary search.
 * Returns -1 if data was not found.
 * ```js
 * indexOf([1,2,3], 3); // 2
 * indexOf([1,2,3], 0); // -1, not found
 * ```
 *
 * By default uses Javascript comparision semantics.
 * Passing in `comparer` is needed when working with an array of objects.
 * @param data Array of data
 * @param sought Item to search for
 * @param comparer Comparer (by default uses JS semantics)
 * @returns Index of sought item or -1 if not found.
 */
export function indexOf<T>(data: T[], sought: T, comparer: Comparer<T> = defaultComparer): number {
  const range = matchingRange(data, sought, comparer);
  if (!range)
    return -1;
  return range.startIndex;
}

/**
 * Returns the lower bound index for an item in a sorted array using a binary search.
 * This is the index at which the item would be inserted to maintain sorted order, and is to the left of any existing entries in the case of equal values.
 *
 * ```js
 * const data = [2, 8, 16, 32];
 * Sorted.lowerBound(data, 1);   // 0
 * Sorted.lowerBound(data, 2);   // 0
 * Sorted.lowerBound(data, 3);   // 1
 * Sorted.lowerBound(data, 320); // 4
 * ```
 *
 * If item is past the end of the array, the length of the array is returned (which is the index at which the item would be inserted to maintain sorted order).
 *
 * @param sortedList Sorted list
 * @param item Item
 * @param comparer Comparer
 * @returns Index
 */
export function lowerBound<T>(
  sortedList: T[],
  item: T,
  comparer: Comparer<T> = defaultComparer,
): number {
  let left = 0;
  let right = sortedList.length;
  while (left < right) {
    const mid = (left + right) >> 1;
    if (comparer(sortedList[mid], item) < 0) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return left;
}

/**
 * Returns the upper bound index for an item in a sorted array using a binary search.
 * This is the index at which the item would be inserted to maintain sorted order, and is to the right of any existing entries in the case of equal values.
 * ```js
 * const data = [2, 8, 16, 32];
 * Sorted.upperBound(data, 1); // 0
 * Sorted.upperBound(data, 2); // 1
 * Sorted.upperBound(data, 3); // 1
 * ```
 * It the item is past the end of the array, the length of the array is returned (which is the index at which the item would be inserted to maintain sorted order).
 * @param sortedList
 * @param item
 * @param comparer
 */
export function upperBound<T>(sortedList: T[], item: T, comparer: Comparer<T> = defaultComparer): number {
  let left = 0;
  let right = sortedList.length;
  while (left < right) {
    const mid = (left + right) >> 1;
    if (comparer(sortedList[mid], item) <= 0) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left;
}

/**
 * Returns the index range of `sortedList` where item(s) equal to `item` are found. Returns `undefined`
 * if `item` was not found.
 *
 * ```js
 * const data = [2, 8, 16, 16, 32];
 * Sorted.matchingRange(data, 1);  // _undefined_
 * Sorted.matchingRange(data, 8);  // { startIndex: 1, endIndex: 1 }
 * Sorted.matchingRange(data, 16); // { startIndex: 2, endIndex: 3 }
 * ```
 * @param sortedList
 * @param item
 * @param comparer
 * @returns Matching range of `item`, or _undefined_ if not found.
 */
export function matchingRange<T>(
  sortedList: T[],
  item: T,
  comparer: Comparer<T> = defaultComparer,
): { startIndex: number; endIndex: number } | undefined {
  if (sortedList.length === 0)
    return;

  // Lower bound
  const start = lowerBound(sortedList, item, comparer);

  // Not found at all
  if (start >= sortedList.length || comparer(sortedList[start], item) !== 0)
    return;

  // Upper bound
  const end = upperBound(sortedList, item, comparer) - 1;

  return { startIndex: start, endIndex: end };
}

/**
 * Returns index to insert data into a sorted array using a binary search.
 * Adds to the right of existing entries in the case of equal values.
 *
 * By default uses Javascript comparision semantics.
 * Passing in `comparer` is needed when working with an array of objects.
 * @param data
 * @param toInsert
 * @param comparer
 */
export function insertionIndex<T>(data: T[], toInsert: T, comparer: Comparer<T> = defaultComparer): number {
  if (typeof comparer !== `function`)
    throw new TypeError(`Param 'comparer' is not a function`);
  if (!Array.isArray(data))
    throw new TypeError(`Param 'data' is not an array`);

  return upperBound(data, toInsert, comparer);
}

/**
 * Inserts an item into a sorted array, returning a new array.
 * ```js
 * let data = [ 1, 2, 3, 4 ];
 * data = insert(data, 2.5);
 * // [ 1, 2, 2.5, 3, 4 ]
 * ```
 *
 * By default uses Javascript comparision semantics.
 * Passing in `comparer` is needed when working with an array of objects.
 * @param sortedArray Sorted array
 * @param toInsert Data to insert
 * @param comparer Comparer, uses JS default semantics if not specified.
 * @returns Returns new array with item inserted.
 */
export function insert<T>(sortedArray: T[], toInsert: T, comparer: Comparer<T> = defaultComparer): T[] {
  // const index = insertionIndex(sortedArray, toInsert, 0, sortedArray.length, comparer);
  const index = insertionIndex(sortedArray, toInsert, comparer);
  const pre = sortedArray.slice(0, index);
  const post = sortedArray.slice(index);
  return [...pre, toInsert, ...post];
}

/**
 * Removes item(s) from a sorted array if it exists, returning the modified array.
 *
 * ```js
 * let data = [ 1, 2, 3, 3, 4 ];
 * data = remove(data, 3);
 * // [ 1, 2, 4 ]
 * ```
 *
 * By default uses Javascript comparision semantics, removing items considered equal to `toRemove`.
 * Passing in `comparer` is needed when working with an array of objects.
 *
 * @param sortedArray Sorted array
 * @param toRemove Item to remove
 * @param comparer Comparer
 * @returns Returns new array with item removed if it was found, otherwise original array.
 */
export function remove<T>(sortedArray: T[], toRemove: T, comparer: Comparer<T> = defaultComparer): T[] {
  const range = matchingRange(sortedArray, toRemove, comparer);
  if (!range)
    return sortedArray;

  const pre = sortedArray.slice(0, range.startIndex);
  const post = sortedArray.slice(range.endIndex + 1);
  return [...pre, ...post];
}

/**
 * Merges two sorted arrays, returning result.
 *
 * ```js
 * const a = [ 4, 7, 10 ]
 * const b = [ 1, 2, 9, 11 ]
 * const c = merge(a, b);
 * // [ 1, 2, 4, 7, 9, 10, 11 ]
 * ```
 *
 * Undefined behaviour if either input array is not sorted.
 *
 * By default uses Javascript comparision semantics.
 * Passing in `comparer` is needed when working with an array of objects.
 * @param a Sorted array
 * @param b Sorted array
 * @param comparer Comparator
 */
export function merge<T>(a: T[], b: T[], comparer: Comparer<T> = defaultComparer): T[] {
  // Adapted from https://github.com/larrybotha/building-algorithms-using-typescript/blob/master/src/09-merge-sort-algorithm.ts
  const t: T[] = [];
  let aIndex = 0;
  let bIndex = 0;

  while (aIndex + bIndex < a.length + b.length) {
    const aItem = a[aIndex];
    const bItem = b[bIndex];
    const comp = comparer(aItem, bItem);
    if (aItem === undefined) {
      t.push(bItem);
      bIndex++;
    } else if (bItem === undefined) {
      t.push(aItem);
      aIndex++;
    } else if (comp < 0) {
      t.push(aItem);
      aIndex++;
    } else {
      t.push(bItem);

      bIndex++;
    }
  }
  return t;
}

function sortMerge<T>(data: T[] | readonly T[], comparer: Comparer<T> = defaultComparer): T[] {
  // Adapted from https://github.com/larrybotha/building-algorithms-using-typescript/blob/master/src/09-merge-sort-algorithm.ts
  if (data.length <= 1)
    return [...data];
  const mIndex = Math.floor(data.length / 2);
  const a = data.slice(0, mIndex);
  const b = data.slice(mIndex);
  return merge(sortMerge(a, comparer), sortMerge(b, comparer), comparer);
}

export type SortAlgorithm = `default` | `merge`;

/**
 * Returns a sorted version of `data` using a specified algorithm. Original array is left as-is
 * ```js
 * const data = [ 10, 2, 9, 5 ]
 * sort(data, `merge`); // [ 2, 5, 9, 20 ]
 * ```
 *
 * By default uses in-built semantics for comparison. But a function can be provided.
 * Return 0 if `a` and `b` are equal, above 0 if `a` is considered higher than `b` or below zero if `b` is considered higher than `a`.
 *
 * In the below example, the default sorting semantics are reversed:
 * ```js
 * const reverse = (a, b) => {
 *   if (a === b) return 0;
 *   if (a > b) return -1;
 *   if (a < b) return 1;
 *   return 0; // equal
 * }
 * sort(data, reverse); // [ 20, 9, 5, 2 ]
 * ```
 * @param data
 * @param algo
 * @param comparer
 * @returns Sorted array
 */
export function sort<T>(data: T[] | readonly T[], algo: SortAlgorithm = `default`, comparer: Comparer<T> = defaultComparer): T[] {
  switch (algo) {
    case `merge`:
      return sortMerge(data, comparer);
    case `default`:
      return data.toSorted(comparer);
  }
}