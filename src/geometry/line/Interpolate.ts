import { throwNumberTest, throwPercentTest } from "../../util/GuardNumbers.js";
import type { Point } from "../point/PointType.js";
import type { Line } from "./LineType.js";
import { getPointParameter } from "./GetPointsParameter.js";
import { length } from "./Length.js";
/**
 * Calculates a point in-between `a` and `b`.
 * 
 * If an interpolation amount below 0 or above 1 is given, _and_
 * `allowOverflow_ is true, a point will be returned that is extended
 * past `line`. This is useful for easing functions which might
 * briefly go past the limits.
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * 
 * // Get {x,y} at 50% along line
 * Lines.interpolate(0.5, line);
 * 
 * // Get {x,y} at 80% between point A and B
 * Lines.interpolate(0.8, ptA, ptB);
 * ```
 * @param amount Relative position, 0 being at a, 0.5 being halfway, 1 being at b
 * @param a Start
 * @param pointB End
 * @returns Point between a and b
 */
export function interpolate(amount: number, a: Point, pointB: Point, allowOverflow?: boolean): Point;

/**
 * Calculates a point in-between `line`'s start and end points.
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * 
 * // Get {x, y } at 50% along line
 * Lines.interpolate(0.5, line);
 * ```
 * 
 * Any additional properties from `b`  are returned on the result as well.
 * @param amount 0..1 
 * @param line Line
 * @param allowOverflow If true, interpolation amount is permitted to exceed 0..1, extending the line
 */
export function interpolate(amount: number, line: Line, allowOverflow?: boolean): Point;

/**
 * Calculates a point in-between a line's start and end points.
 * 
 * @param amount Interpolation amount
 * @param aOrLine Line, or first point
 * @param pointBOrAllowOverflow Second point (if needed) or allowOverflow.
 * @param allowOverflow If true, interpolation amount is permitted to exceed 0..1, extending the line.
 * @returns 
 */
//eslint-disable-next-line func-style
export function interpolate(amount: number, aOrLine: Point | Line, pointBOrAllowOverflow?: Point | boolean, allowOverflow?: boolean): Point {

  if (typeof pointBOrAllowOverflow === `boolean`) {
    allowOverflow = pointBOrAllowOverflow;
    pointBOrAllowOverflow = undefined;
  }

  // eslint-disable-next-line unicorn/no-negated-condition
  if (!allowOverflow) throwPercentTest(amount, `amount`);
  else throwNumberTest(amount, ``, `amount`);

  const [ a, b ] = getPointParameter(aOrLine, pointBOrAllowOverflow);

  const d = length(a, b);
  const d2 = d * (1 - amount);

  // Points are identical, return a copy of b
  if (d === 0 && d2 === 0) return Object.freeze({ ...b });

  const x = b.x - (d2 * (b.x - a.x) / d);
  const y = b.y - (d2 * (b.y - a.y) / d);

  return Object.freeze({
    ...b,
    x: x,
    y: y
  });
}
