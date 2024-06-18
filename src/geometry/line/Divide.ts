import type { Point } from "../point/PointType.js";
import type { Line } from "./LineType.js";
import { divide as PointDivide } from '../point/Divider.js';
/**
 * Divides both start and end points by given x,y
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * 
 * // Line 1,1 -> 10,10
 * const l = Lines.fromNumbers(1,1,10,10);
 * const ll = Lines.divide(l, {x:2, y:4});
 * // Yields: 0.5,0.25 -> 5,2.5
 * ```
 * 
 * Dividing by zero will give Infinity for that dimension.
 * @param line 
 * @param point 
 * @returns 
 */
export const divide = (line: Line, point: Point): Line => Object.freeze({
  ...line,
  a: PointDivide(line.a, point),
  b: PointDivide(line.b, point)
});