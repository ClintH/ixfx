import { piPi } from "../pi.js";
import { guard } from "./guard.js";
import type { Point } from "./point-type.js";

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
 * 
 * @example Calculate angle between a middle of canvas and the cursor
 * ```js
 * const canvasEl = document.querySelector('canvas');
 * const middle = { x: canvasEl.width/2, y: canvasEl.height /2 }
 * 
 * canvasEl.addEventListener(`pointermove`, event => { 
 *  const cursor = {
 *    x: event.offsetX,
 *    y: event.offsetY
 *  }
 *  const a = G.Points.angleRadian(middle, cursor);
 *});
 * ```
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

/**
 * Return the angle of a wedge, defined by a, b and C points, where 'b'
 * could be thought of as the origin or pivot.
 * 
 * @param a 
 * @param b 
 * @param c 
 * @returns 
 */
export const angleRadianThreePoint = (a: Point, b: Point, c: Point) => {
  const ab = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
  const bc = Math.sqrt(Math.pow(b.x - c.x, 2) + Math.pow(b.y - c.y, 2));
  const ac = Math.sqrt(Math.pow(c.x - a.x, 2) + Math.pow(c.y - a.y, 2));
  return Math.acos((bc * bc + ab * ab - ac * ac) / (2 * bc * ab));
}