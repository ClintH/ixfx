import type { Point } from "../point/point-type.js";
import type { Line } from "./line-type.js";
import { subtract as PointsSubtract } from "../point/subtract.js";

/**
 * Subtracts both start and end points by given x,y
 * ```js
 * // Line 1,1 -> 10,10
 * const l = Lines.fromNumbers(1,1,10,10);
 * const ll = Lines.subtract(l, {x:2, y:4});
 * // Yields: -1,-3 -> 8,6
 * ```
 * @param line 
 * @param point 
 * @returns 
 */
export const subtract = (line: Line, point: Point): Line => Object.freeze({
  ...line,
  a: PointsSubtract(line.a, point),
  b: PointsSubtract(line.b, point)
});