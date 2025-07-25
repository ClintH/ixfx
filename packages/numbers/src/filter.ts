import { isValid } from './guard.js';
/**
 * Filters an iterator of values, only yielding
 * those that are valid numbers
 *
 * ```js
 * const data = [true, 10, '5', { x: 5 }];
 * for (const n of Numbers.filterIterable(data)) {
 *  // 10
 * }
 * ```
 * @param it
 */
export function* filterIterable(it: Iterable<unknown>) {
  for (const v of it) {
    if (isValid(v)) yield v;
  }
}

/**
 * Returns a function that yields _true_ if a value
 * is at least `threshold`
 * ```js
 * const t = thresholdAtLeast(50);
 * t(50); // true
 * t(0);  // false
 * t(55); // true
 * ```
 * @param threshold 
 * @returns 
 */
export const thresholdAtLeast = (threshold: number) => {
  return (v: number) => {
    return v >= threshold;
  };
};

/**
 * Returns a function that yields _true_
 * if a number is at least _min_ and no greater than _max_
 * 
 * ```js
 * const t = rangeInclusive(50, 100);
 * t(40); // false
 * t(50); // true
 * t(60); // true
 * t(100); // true
 * t(101);  // false
 * ```
 * @param min 
 * @param max 
 * @returns 
 */
export const rangeInclusive = (min: number, max: number) => {
  return (v: number) => {
    return v >= min && v <= max;
  };
};