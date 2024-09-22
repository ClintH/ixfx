import { piPi } from "../../numbers/Interpolate.js";
import { guard } from "./Guard.js";
import type { Point } from "./PointType.js";

/**
 * Returns the angle in radians between `a` and `b`.
 *
 * Eg if `a` is the origin, and `b` is another point,
 * in degrees one would get 0 to -180 when `b` was above `a`.
 *  -180 would be `b` in line with `a`.
 * Same for under `a`.
 *
 * Providing a third point `c` gives the interior angle, where `b` is the middle point.
 * 
 * See also {@link angleRadianCircle} which returns coordinates on 0..Math.Pi*2
 * range. This avoids negative numbers.
 * @param a
 * @param b
 * @param c
 * @returns
 */
export const angleRadian = (a: Point, b?: Point, c?: Point) => {
  guard(a, `a`);

  if (b === undefined) {
    return Math.atan2(a.y, a.x);
  }
  guard(b, `b`);
  if (c === undefined) {
    return Math.atan2(b.y - a.y, b.x - a.x);
  }

  guard(c, `c`);
  return Math.atan2(b.y - a.y, b.x - a.x) - Math.atan2(c.y - a.y, c.x - a.x);
};

/**
 * Returns the angle between point(s) using a radian circle system.
 * ```
 *       90deg
 *       Pi/2
 *        |
 * Pi  ---+--- 0
 * 180    |
 *       3PI/2
 *       270deg
 * ```
 * @param a 
 * @param b 
 * @param c 
 * @returns 
 */
export const angleRadianCircle = (a: Point, b?: Point, c?: Point) => {
  const angle = angleRadian(a, b, c);
  if (angle < 0) return angle + piPi
  return angle;
}