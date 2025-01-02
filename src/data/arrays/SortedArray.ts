import { defaultComparer, type Comparer } from "../../util/Comparers.js";

/**
 * Returns index of data in an ascended sorted array using a binary search.
 * Returns -1 if data was not found.
 * ```js
 * indexOf([1,2,3], 3); // 2
 * indexOf([1,2,3], 0); // -1, not found
 * ```
 * 
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