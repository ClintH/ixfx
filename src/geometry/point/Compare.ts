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
 * Compares points based on x value. Y value is ignored.
 * 
 * Return values:
 * * 0: If a.x === b.x
 * * 1: a is to the right of b (ie. a.x > b.x)
 * * -1: a is to the left of b (ie. a.x < b.x)
 *
 * @example Sorting by x
 * ```js
 * arrayOfPoints.sort(Points.compareByX);
 * ```
 * 
 * @param a
 * @param b
 * @returns
 */
export const compareByX = (a: Point, b: Point): number => {
  if (a.x === b.x) return 0;
  if (a.x < b.x) return -1;
  return 1;

  // a.x - b.x || a.y - b.y;
}

/**
 * Compares points based on Y value. X value is ignored.
 * Returns values:
 * * 0: If a.y === b.y
 * * 1: A is below B (ie. a.y > b.y)
 * * -1: A is above B (ie. a.y < b.y)
 *
 * @example Sorting by Y
 * ```js
 * arrayOfPoints.sort(Points.compareByY);
 * ```
 * @param a
 * @param b
 * @returns
 */
export const compareByY = (a: Point, b: Point): number => {
  if (a.y === b.y) return 0;
  if (a.y < b.y) return -1;
  return 1;
}