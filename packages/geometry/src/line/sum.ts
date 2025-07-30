import type { Point } from "../point/point-type.js";
import type { Line } from "./line-type.js";
import { sum as PointsSum } from '../point/sum.js';

/**
 * Adds both start and end points by given x,y
 * ```js
 * 
 * // Line 1,1 -> 10,10
 * const l = Lines.fromNumbers(1,1,10,10);
 * const ll = Lines.sum(l, {x:2, y:4});
 * // Yields: 3,5 -> 12,14
 * ```
 * @param line 
 * @param point 
 * @returns 
 */
export const sum = (line: Line, point: Point): Line => Object.freeze({
  ...line,
  a: PointsSum(line.a, point),
  b: PointsSum(line.b, point)
});