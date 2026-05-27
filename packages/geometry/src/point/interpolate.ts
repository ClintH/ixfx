import type { Point } from "./point-type.js";
import { interpolate as lineInterpolate, interpolator as lineInterpolator } from '../line/interpolate.js';

/**
 * Returns a relative point between two points.
 *
 * ```js
 * interpolate(0.5, { x:0, y:0 }, { x:10, y:10 }); // Halfway { x, y }
 * ```
 *
 * Alias for Lines.interpolate(amount, a, b);
 *
 * If you find yourself calling `interpolate` repeatedly with the same points, consider using {@link interpolator} to create a function that bakes in the points.
 * @param amount Relative amount, 0-1
 * @param a
 * @param b
 * @param allowOverflow If true, length of line can be exceeded for `amount` of below 0 and above `1`.
 * @returns {@link Point} Point
 */
export function interpolate(amount: number, a: Point, b: Point, allowOverflow = false): Point {
  return lineInterpolate(amount, a, b, allowOverflow);
} // ({x: (1-amt) * a.x + amt * b.x, y:(1-amt) * a.y + amt * b.y });

/**
 * Returns a function that interpolates between two points. If you just want to interpolate between two points, use {@link interpolate}.
 *
 * ```js
 * const i = interpolator({ x:0, y:0 }, { x:10, y:10 });
 * i(0.5); // Halfway { x, y }
 * ```
 *
 * If you find yourself not needing to reuse the function because you're always calling `interpolator` with different point values all the time, use {@link interpolate} instead.
 * @param a
 * @param b
 * @param allowOverflow
 * @returns Function to interpolate
 */
export const interpolator = (a: Point, b: Point, allowOverflow = false): (amount: number) => Point => lineInterpolator({ a, b }, allowOverflow);
