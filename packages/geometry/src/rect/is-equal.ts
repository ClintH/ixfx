import { isPositioned } from "./guard.js";
import type { Rect, RectPositioned } from "./rect-types.js";
import { isEqual as PointsIsEqual } from '../point/is-equal.js';
/**
 * Returns _true_ if the width & height of the two rectangles is the same.
 *
 * ```js
 * const rectA = { width: 10, height: 10, x: 10, y: 10 };
 * const rectB = { width: 10, height: 10, x: 20, y: 20 };
 *
 * // True, even though x,y are different
 * Rects.isEqualSize(rectA, rectB);
 *
 * // False, because coordinates are different
 * Rects.isEqual(rectA, rectB)
 * ```
 * @param a
 * @param b
 * @returns
 */
export const isEqualSize = (a: Rect, b: Rect): boolean => {
  if (a === undefined) throw new Error(`a undefined`);
  if (b === undefined) throw new Error(`b undefined`);
  return a.width === b.width && a.height === b.height;
};

/**
 * Returns _true_ if two rectangles have identical values.
 * Both rectangles must be positioned or not.
 *
 * ```js
 * const rectA = { width: 10, height: 10, x: 10, y: 10 };
 * const rectB = { width: 10, height: 10, x: 20, y: 20 };
 *
 * // False, because coordinates are different
 * Rects.isEqual(rectA, rectB)
 *
 * // True, even though x,y are different
 * Rects.isEqualSize(rectA, rectB);
 * ```
 * @param a
 * @param b
 * @returns
 */
export const isEqual = (
  a: Rect | RectPositioned,
  b: Rect | RectPositioned
): boolean => {
  if (isPositioned(a) && isPositioned(b)) {
    if (!PointsIsEqual(a, b)) return false;
    return a.width === b.width && a.height === b.height;
  } else if (!isPositioned(a) && !isPositioned(b)) {
    return a.width === b.width && a.height === b.height;
  } else {
    // One param is positioned, the other is not
    return false;
  }
};