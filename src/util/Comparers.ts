import { defaultToString } from "./ToString.js";

export type CompareResult = number; // 0 | 1 | -1;
export type Comparer<V> = (a: V, b: V) => CompareResult;

/**
 * Sort numbers in ascending order.
 *
 * ```js
 * [10, 4, 5, 0].sort(numericComparer);
 * // Yields: [0, 4, 5, 10]
 * [10, 4, 5, 0].sort(comparerInverse(numericComparer));
 * // Yields: [ 10, 5, 4, 0]
 * ```
 * @param x
 * @param y
 * @returns
 */
export const numericComparer = (x: number, y: number): CompareResult => {
  // ✔️ Unit tested
  if (x === y) return 0;
  if (x > y) return 1;
  return -1;
};

/**
 * Default sort comparer, following same sematics as Array.sort.
 * Consider using {@link defaultComparer} to get more logical sorting of numbers.
 *
 * Note: numbers are sorted in alphabetical order, eg:
 * ```js
 * [ 10, 20, 5, 100 ].sort(jsComparer); // same as .sort()
 * // Yields: [10, 100, 20, 5]
 * ```
 * @param x
 * @param y
 * @returns
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const jsComparer = (x: any, y: any): CompareResult => {
  // ✔️ Unit tested

  // Via https://stackoverflow.com/questions/47334234/how-to-implement-array-prototype-sort-default-compare-function
  if (x === undefined && y === undefined) return 0;
  if (x === undefined) return 1;
  if (y === undefined) return -1;

  const xString = defaultToString(x);
  const yString = defaultToString(y);

  if (xString < yString) return -1;
  if (xString > yString) return 1;
  return 0;
};

/**
 * Inverts the source comparer.
 * @param comparer
 * @returns
 */
export const comparerInverse = <V>(comparer: Comparer<V>): Comparer<V> => {
  return (x: V, y: V) => {
    const v = comparer(x, y);
    return v * -1;
  };
};

/**
 * Compares numbers by numeric value, otherwise uses the default
 * logic of string comparison.
 *
 * Is an ascending sort:
 *  b, a, c -> a, b, c
 *  10, 5, 100 -> 5, 10, 100
 * @param x
 * @param y
 * @see {@link comparerInverse} Inverted order
 * @returns
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const defaultComparer = (x: any, y: any): CompareResult => {
  if (typeof x === `number` && typeof y === `number`) {
    return numericComparer(x, y);
  }
  return jsComparer(x, y);
};