import type { Point } from "../point/PointType.js"
import * as Polar from "../Polar.js";
import { radianInvert } from "../Angles.js";

/**
 * Creates a line from an origin point.
 * ```js
 * // Line of length 0.2 with middle at 0.5,0.5
 * fromPivot({ x:0.5, y:0.5 }, 0.2);
 * // Same line, but on an angle
 * fromPivot({ x:0.5, y:0.5 }, 0.2, degreesToRadian(45));
 * 
 * // ...now with pivot point at 20%, rather than center
 * fromPivot({ x:0.5, y:0.5 }, 0.2, degreesToRadian(45), 0.2);
 * ```
 * 
 * Examples:
 * * Angle of 0 (deg/rad) results in a horizontal line,
 * * Angle of 90deg in a vertical line. 
 * * Angle of 45deg will be angled downwards.
 * 
 * @param origin Origin to pivot around
 * @param length Total length of line
 * @param angleRadian Angle of line, in radians
 * @param balance Percentage of where origin ought to be on line. Default: 0.5, meaning the middle of line
 */
export const fromPivot = (origin: Point = { x: 0.5, y: 0.5 }, length: number = 1, angleRadian: number = 0, balance: number = 0.5) => {
  const left = length * balance;
  const right = length * (1 - balance);
  const a = Polar.toCartesian(left, radianInvert(angleRadian), origin);
  const b = Polar.toCartesian(right, angleRadian, origin);
  return Object.freeze({
    a, b
  });
}