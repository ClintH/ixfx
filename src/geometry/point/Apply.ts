import { guard } from "./Guard.js";
import type { Point } from "./PointType.js";

/**
 * Applies `fn` on `x` and `y` fields, returning all other fields as well
 * ```js
 * const p = {x:1.234, y:4.9};
 * const p2 = Points.apply(p, Math.round);
 * // Yields: {x:1, y:5}
 * ```
 *
 * The name of the field is provided as well. Here we only round the `x` field:
 *
 * ```js
 * const p = {x:1.234, y:4.9};
 * const p2 = Points.apply(p, (v, field) => {
 *  if (field === `x`) return Math.round(v);
 *  return v;
 * });
 * ```
 * @param pt
 * @param fn
 * @returns
 */
export const apply = (
  pt: Point,
  fn: (v: number, field?: string) => number
): Point => {
  guard(pt, `pt`);

  return Object.freeze<Point>({
    ...pt,
    x: fn(pt.x, `x`),
    y: fn(pt.y, `y`),
  });
}