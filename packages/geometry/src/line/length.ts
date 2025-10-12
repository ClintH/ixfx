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
export function length(a: Point, b: Point, force2d?: boolean): number;

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
export function length(line: Line | PolyLine, force2d?: boolean): number;

/**
 * Returns length of line, polyline or between two points
 * 
 * @param aOrLine Point A, line or polyline (array of lines)
 * @param pointB Point B, if first parameter is a point
 * @returns Length (total accumulated length for arrays)
 */

export function length(aOrLine: Point | Line | PolyLine, pointBOrForce2d?: Point | boolean, force2d?: boolean): number {
  if (isPolyLine(aOrLine)) {
    const _force2d = typeof pointBOrForce2d === `boolean` ? pointBOrForce2d : false;
    const sum = aOrLine.reduce((accumulator, v) => length(v, _force2d) + accumulator, 0);
    return sum;
  }
  if (aOrLine === undefined) throw new TypeError(`Parameter 'aOrLine' is undefined`);
  const [ a, b ] = typeof pointBOrForce2d === `object` ? getPointParameter(aOrLine, pointBOrForce2d) : getPointParameter(aOrLine);
  const x = b.x - a.x;
  const y = b.y - a.y;
  const _force2d = typeof pointBOrForce2d === `boolean` ? pointBOrForce2d :
    typeof force2d === `boolean` ? force2d : false;
  if (!_force2d && a.z !== undefined && b.z !== undefined) {
    const z = b.z - a.z;
    return Math.hypot(x, y, z);
  } else {
    return Math.hypot(x, y);
  }
}
