import type { Point } from "../point/point-type.js";
import { getPointParameter } from "./get-points-parameter.js";
import { isPolyLine } from "./guard.js";
import type { Line, PolyLine } from "./line-type.js";

/**
 * Returns the length between two points
 * ```js
 * Lines.length(ptA, ptB);
 * ```
 * @param a First point
 * @param b Second point
 * @returns 
 */
export function length(a: Point, b: Point): number;

/**
 * Returns length of line. If a polyline (array of lines) is provided,
 * it is the sum total that is returned.
 * 
 * ```js
 * Lines.length(a: {x:0, y:0}, b: {x: 100, y:100});
 * Lines.length(lines);
 * ```
 * @param line Line
 */
export function length(line: Line | PolyLine): number;

/**
 * Returns length of line, polyline or between two points
 * 
 * @param aOrLine Point A, line or polyline (array of lines)
 * @param pointB Point B, if first parameter is a point
 * @returns Length (total accumulated length for arrays)
 */

export function length(aOrLine: Point | Line | PolyLine, pointB?: Point): number {
  if (isPolyLine(aOrLine)) {
    const sum = aOrLine.reduce((accumulator, v) => length(v) + accumulator, 0);
    return sum;
  }
  if (aOrLine === undefined) throw new TypeError(`Parameter 'aOrLine' is undefined`);
  const [ a, b ] = getPointParameter(aOrLine, pointB);
  const x = b.x - a.x;
  const y = b.y - a.y;
  if (a.z !== undefined && b.z !== undefined) {
    const z = b.z - a.z;
    return Math.hypot(x, y, z);
  } else {
    return Math.hypot(x, y);
  }
}
