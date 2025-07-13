import { guard, isPoint3d } from "./guard.js";
import type { Point, Point3d } from "./point-type.js";

// type PointFields = `x` | `y`;
// type Point3dFields = PointFields & 'z';

export type PointApplyFn = (v: number, field: `x` | `y`) => number;
export type Point3dApplyFn = (v: number, field: `x` | `y` | `z`) => number;

export function apply(pt: Point3d, fn: Point3dApplyFn): Point3d
export function apply(pt: Point, fn: PointApplyFn): Point;

/**
 * Applies `fn` on x,y & z (if present) fields, returning all other fields as well
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
export function apply(
  pt: Point,
  fn: Point3dApplyFn | PointApplyFn
): Point {
  guard(pt, `pt`);
  if (isPoint3d(pt)) {
    return Object.freeze<Point3d>({
      ...pt,
      x: fn(pt.x, `x`),
      y: fn(pt.y, `y`),
      z: (fn as Point3dApplyFn)(pt.z, `z`)
    });
  }
  return Object.freeze<Point>({
    ...pt,
    x: fn(pt.x, `x`),
    y: fn(pt.y, `y`),
  });
}