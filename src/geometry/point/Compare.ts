import type { Point } from "./PointType.js";

/**
 * Returns -2 if both x & y of a is less than b
 * Returns -1 if either x/y of a is less than b
 *
 * Returns 2 if both x & y of a is greater than b
 * Returns 1 if either x/y of a is greater than b's x/y
 *
 * Returns 0 if x/y of a and b are equal
 * @param a
 * @param b
 * @returns
 */
export const compare = (a: Point, b: Point): number => {
  if (a.x < b.x && a.y < b.y) return -2;
  if (a.x > b.x && a.y > b.y) return 2;
  if (a.x < b.x || a.y < b.y) return -1;
  if (a.x > b.x || a.y > b.y) return 1;
  if (a.x === b.x && a.x === b.y) return 0;
  return Number.NaN;
};

/**
 * Compares points based on x value.
 * Returns above 0 if a.x > b.x (to the right)
 * Returns 0 if a.x === b.x
 * Returns below 0 if a.x < b.x (to the left)
 *
 * @example Sorting by x
 * ```js
 * arrayOfPoints.sort(Points.compareByX);
 * ```
 * @param a
 * @param b
 * @returns
 */
export const compareByX = (a: Point, b: Point): number =>
  a.x - b.x || a.y - b.y;