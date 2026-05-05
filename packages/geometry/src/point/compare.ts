import type { Point, Point3d } from "./point-type.js";

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
 */
export function compare(a: Point, b: Point): number {
  if (a.x < b.x && a.y < b.y)
    return -2;
  if (a.x > b.x && a.y > b.y)
    return 2;
  if (a.x < b.x || a.y < b.y)
    return -1;
  if (a.x > b.x || a.y > b.y)
    return 1;
  if (a.x === b.x && a.x === b.y)
    return 0;
  return Number.NaN;
}

/**
 * Compares points row-wise.
 *
 * A point is considered less if has a lower `y` value, or if `y` values are equal, a lower `x` value.
 *
 * Returns 0 if points are equal, -1 if a is less than b, 1 if a is greater than b.
 *
 * This can be used for sorting points in a row-wise manner, for example:
 * ```js
 * arrayOfPoints.sort(Points.compareRowwise);
 * ```
 * @param a
 * @param b
 */
export function compareRowwise(a: Point, b: Point): number {
  if (a.y < b.y)
    return -1;
  if (a.y > b.y)
    return 1;
  if (a.x < b.x)
    return -1;
  if (a.x > b.x)
    return 1;
  return 0;
}

/**
 * Returns a rectangle from two points, where it's uncertain if
 * a/b ought to be top-left or bottom-right.
 *
 * To resolve this, we use Points.compareRowwise to determine which point is top-left and which is bottom-right.
 * @param a
 * @param b
 */
export function getAsBounds(a: Point, b: Point): { topLeft: Point; bottomRight: Point } {
  const topLeft = compareRowwise(a, b) <= 0 ? a : b;
  const bottomRight = topLeft === a ? b : a;
  return { topLeft, bottomRight };
}

/**
 * Compares points based on x value. Y value is ignored.
 *
 * Return values:
 * 0: If a.x === b.x
 * 1: a is to the right of b (ie. a.x > b.x)
 * -1: a is to the left of b (ie. a.x < b.x)
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
export function compareByX(a: Point, b: Point): number {
  if (a.x === b.x)
    return 0;
  if (a.x < b.x)
    return -1;
  return 1;

  // a.x - b.x || a.y - b.y;
}

/**
 * Compares points based on Y value. X value is ignored.
 *
 * Return values:
 * 0: If a.y === b.y
 * 1: A is below B (ie. a.y > b.y)
 * -1: A is above B (ie. a.y < b.y)
 *
 * @example Sorting by Y
 * ```js
 * arrayOfPoints.sort(Points.compareByY);
 * ```
 * @param a
 * @param b
 * @returns
 */
export function compareByY(a: Point, b: Point): number {
  if (a.y === b.y)
    return 0;
  if (a.y < b.y)
    return -1;
  return 1;
}

/**
 * Compares points based on Z value. XY values are ignored.
 *
 * Return values:
 * 0: If a.z === b.z
 * 1: A is below B (ie. a.z > b.z)
 * -1: A is above B (ie. a.z < b.z)
 *
 * @example Sorting by Y
 * ```js
 * arrayOfPoints.sort(Points.compareByZ);
 * ```
 * @param a
 * @param b
 * @returns
 */
export function compareByZ(a: Point3d, b: Point3d): number {
  if (a.z === b.z)
    return 0;
  if (a.z < b.z)
    return -1;
  return 1;
}