import type { Point } from "../point/PointType.js";
import type { Line } from "./LineType.js";
import { guard as guardPoint } from '../point/Guard.js';

/**
 * Returns a line from two points
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * // Line from 0,1 to 10,15
 * const line = Lines.fromPoints( { x:0, y:1 }, { x:10, y:15 });
 * // line is: { a: { x: 0, y: 1}, b: { x: 10, y: 15 } };
 * ```
 * @param a Start point
 * @param b End point
 * @returns 
 */
export const fromPoints = (a: Point, b: Point): Line => {
  guardPoint(a, `a`);
  guardPoint(b, `b`);
  a = Object.freeze({ ...a });
  b = Object.freeze({ ...b });
  return Object.freeze({
    a: a,
    b: b
  });
};

