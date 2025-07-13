import type { Line } from "./line-type.js";
import { multiply as PointsMultiply, type Point } from "../point/index.js";
/**
 * Multiplies start and end of line by point.x, point.y.
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * 
 * // Line 1,1 -> 10,10
 * const l = Lines.fromNumbers(1, 1, 10, 10);
 * const ll = Lines.multiply(l, {x:2, y:3});
 * // Yields: 2,20 -> 3,30
 * ```
 * @param line 
 * @param point 
 * @returns 
 */
export const multiply = (line: Line, point: Point): Line => (Object.freeze({
  ...line,
  a: PointsMultiply(line.a, point),
  b: PointsMultiply(line.b, point)
}));