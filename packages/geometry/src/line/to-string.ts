import type { Point } from "../point/point-type.js";
import { guard, isLine } from "./guard.js";
import type { Line } from "./line-type.js";
import { toString as PointsToString } from '../point/index.js';
/**
 * Returns a string representation of two points
 * ```js
 * console.log(Lines.toString(a, b)));
 * ```
 * @param a 
 * @param b 
 * @returns 
 */
export function toString(a: Point, b: Point): string;

/**
 * Returns a string representation of a line 
 * ```js
 * Lines.toString(line);
 * ```
 * @param line 
 */
export function toString(line: Line): string;

/**
 * Returns a string representation of a line or two points.
 * @param a
 * @param b 
 * @returns 
 */
export function toString(a: Point | Line, b?: Point): string {
  if (isLine(a)) {
    guard(a, `a`);
    b = a.b;
    a = a.a;
  } else if (b === undefined) throw new Error(`Expect second point if first is a point`);
  return PointsToString(a) + `-` + PointsToString(b);
}

