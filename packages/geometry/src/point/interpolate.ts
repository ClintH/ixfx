import type { Point } from "./point-type.js";
import { interpolate as lineInterpolate } from '../line/interpolate.js';

/**
 * Returns a relative point between two points.
 * 
 * ```js
 * interpolate(0.5, { x:0, y:0 }, { x:10, y:10 }); // Halfway { x, y }
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
