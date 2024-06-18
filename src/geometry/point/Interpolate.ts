import type { Point } from "./PointType.js";
import { interpolate as lineInterpolate } from '../line/Interpolate.js';

/**
 * Returns a relative point between two points
 * ```js
 * interpolate(0.5, a, b); // Halfway point between a and b
 * ```
 *
 * Alias for Lines.interpolate(amount, a, b);
 *
 * @param amount Relative amount, 0-1
 * @param a
 * @param b
 * @param allowOverflow If true, length of line can be exceeded for `amount` of below 0 and above `1`.
 * @returns {@link Point}
 */
export const interpolate = (
  amount: number,
  a: Point,
  b: Point,
  allowOverflow = false
): Point => lineInterpolate(amount, a, b, allowOverflow); //({x: (1-amt) * a.x + amt * b.x, y:(1-amt) * a.y + amt * b.y });
