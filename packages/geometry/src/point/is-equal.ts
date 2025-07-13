import type { Point } from "./point-type.js";

/**
 * Returns _true_ if the points have identical values
 *
 * ```js
 * const a = {x: 10, y: 10};
 * const b = {x: 10, y: 10;};
 * a === b        // False, because a and be are different objects
 * isEqual(a, b)   // True, because a and b are same value
 * ```
 * @param p Points
 * @returns _True_ if points are equal
 */
export const isEqual = (...p: ReadonlyArray<Point>): boolean => {
  if (p === undefined) throw new Error(`parameter 'p' is undefined`);
  if (p.length < 2) return true;

  for (let index = 1; index < p.length; index++) {
    if (p[ index ].x !== p[ 0 ].x) return false;
    if (p[ index ].y !== p[ 0 ].y) return false;
  }
  return true;
};