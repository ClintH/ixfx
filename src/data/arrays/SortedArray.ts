import { defaultComparer, type Comparer } from "../../util/Comparers.js";

/**
 * Returns an immutable wrapper around an array, initially unsorted.
 * Sorts data and passes to {@link wrapSorted}.
 * @param unsortedData 
 * @param comparer 
 * @returns 
 */
export const wrapUnsorted = <T>(unsortedData: Array<T>, comparer: Comparer<T> = defaultComparer) => wrapSorted(unsortedData.toSorted(comparer));

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
 * @returns 
 */
export const wrapSorted = <T>(sortedData: Array<T>, comparer: Comparer<T> = defaultComparer) => {
  const store = [ ...sortedData ];
  return {
    /**
     * Returns index of an item, or -1 if not found
     * @param sought Item to find
     * @param start 
     * @param end 
     * @returns 
     */
    indexOf: (sought: T, start = 0, end = store.length) => {
      return indexOf(store, sought, start, end, comparer);
    },
    insertionIndex: (toInsert: T) => {
      return insertionIndex(store, toInsert, 0, store.length, comparer);
    },
    /**
     * Inserts an item, returning a new wrapper
     * @param toInsert 
     * @returns 
     */
    insert: (toInsert: T) => {
      return wrapSorted(insert(store, toInsert, comparer), comparer);
    },
    /**
     * Removes an item, returning a new wrapper
     * @param toRemove 
     * @returns 
     */
    remove: (toRemove: T) => {
      return wrapSorted(remove(store, toRemove, comparer));
    },
    /**
     * Gets item at a specified offset
     * @param offset 
     * @returns 
     */
    at: (offset: number) => {
      return store.at(offset);
    },
    /**
     * Gets length
     */
    get length() {
      return store.length;
    },
    /**
     * Gets underlying data.
     * Be careful not to mutate. Use `toArray` to get a copy
     * that can be modified.
     */
    get data() {
      return store;
    },
    /**
     * Returns a copy of data which is safe to modify.
     * @returns 
     */
    toArray: () => {
      return [ ...store ]
    }
  }
}

/**
 * Returns index of data in an ascended sorted array using a binary search.
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
 * @param start Start point
 * @param end End index
 * @param comparer Comparer (by default uses JS semantics)
 * @returns Index of sought item or -1 if not found.
 */
export const indexOf = <T>(data: Array<T>, sought: T, start = 0, end = data.length, comparer: Comparer<T> = defaultComparer): number => {
  if (end <= start) return -1;
  const mid = Math.floor((start + end) / 2);
  const result = comparer(data[ mid ], sought);

  // Result is at the middle
  if (result === 0) return mid;

  if (result > 0) {
    // data[mid] is greater than sought, must be in left side
    return indexOf(data, sought, start, mid - 1, comparer);
  }

  // data[mid] is less than sought, must be in right side
  return indexOf(data, sought, mid + 1, end, comparer);
}

/**
 * Returns index to insert data into a sorted array using a binary search.
 * Adds to the right of existing entries in the case of equal values.
 * 
 * By default uses Javascript comparision semantics. 
 * Passing in `comparer` is needed when working with an array of objects.
 * @param data 
 * @param toInsert 
 * @param start 
 * @param end 
 * @param comparer 
 */
export const insertionIndex = <T>(data: Array<T>, toInsert: T, start = 0, end = data.length, comparer: Comparer<T> = defaultComparer): number => {
  const mid = Math.floor((start + end) / 2);

  const result = comparer(data[ mid ], toInsert);
  //console.log(`mid index: ${ mid } mid data: ${ data[ mid ] } result: ${ result } value: ${ toInsert } start: ${ start } end: ${ end }`);

  // Result is at the middle
  if (result === 0) return mid + 1;

  if (result > 0) {
    if (start === end) return start;
    if (start + 1 === end) return start;
    // data[mid] is greater than sought, must be in left side
    return insertionIndex(data, toInsert, start, mid - 1, comparer);
  }

  // data[mid] is less than sought, must be in right side
  return insertionIndex(data, toInsert, mid + 1, end, comparer);
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
 * @returns 
 */
export const insert = <T>(sortedArray: Array<T>, toInsert: T, comparer: Comparer<T> = defaultComparer) => {
  const index = insertionIndex(sortedArray, toInsert, 0, sortedArray.length, comparer);
  const pre = sortedArray.slice(0, index);
  const post = sortedArray.slice(index);
  return [ ...pre, toInsert, ...post ];
}

/**
 * Removes item from a sorted array if it exists, returning the modified array.
 * ```js
 * let data = [ 1, 2, 3, 4 ];
 * data = remove(data, 3);
 * // [ 1, 2, 4 ]
 * ```
 * 
 * By default uses Javascript comparision semantics. 
 * Passing in `comparer` is needed when working with an array of objects.
 * @param data 
 * @param toRemove 
 * @param comparer 
 * @returns 
 */
export const remove = <T>(data: Array<T>, toRemove: T, comparer: Comparer<T> = defaultComparer) => {
  const index = indexOf(data, toRemove, 0, data.length, comparer);
  if (index === -1) return data;
  const pre = data.slice(0, index);
  const post = data.slice(index + 1);
  return [ ...pre, ...post ];
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
export const merge = <T>(a: Array<T>, b: Array<T>, comparer: Comparer<T> = defaultComparer): Array<T> => {
  // Adapted from https://github.com/larrybotha/building-algorithms-using-typescript/blob/master/src/09-merge-sort-algorithm.ts
  const t: Array<T> = [];
  let aIndex = 0;
  let bIndex = 0;

  while (aIndex + bIndex < a.length + b.length) {
    const aItem = a[ aIndex ];
    const bItem = b[ bIndex ];
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

const sortMerge = <T>(data: Array<T> | ReadonlyArray<T>, comparer: Comparer<T> = defaultComparer): Array<T> => {
  // Adapted from https://github.com/larrybotha/building-algorithms-using-typescript/blob/master/src/09-merge-sort-algorithm.ts
  if (data.length <= 1) return [ ...data ];
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
export const sort = <T>(data: Array<T> | ReadonlyArray<T>, algo: SortAlgorithm = `default`, comparer: Comparer<T> = defaultComparer): Array<T> => {
  switch (algo) {
    case `merge`:
      return sortMerge(data, comparer);
    case "default":
      return data.toSorted(comparer);
  }
}