import { getTwoPointParameters } from "./GetPointParameter.js";
import { guard, isPoint3d } from "./Guard.js";
import type { Point, Point3d } from "./PointType.js";
import type { Writeable } from "../../TsUtil.js";

export function multiply(a: Point, b: Point): Point;
export function multiply(a: Point3d, b: Point3d): Point3d;
export function multiply(a: Point, x: number, y: number): Point;
export function multiply(a: Point3d, x: number, y: number, z: number): Point3d;
export function multiply(ax: number, ay: number, bx: number, by: number): Point;
export function multiply(ax: number, ay: number, az: number, bx: number, by: number, bz: number): Point3d;

/**
 * Returns a Point with the x,y,z values of two points multiply (a/b).
 * 
 * `z` parameter is used, if present. Uses a default value of 0 for 'z' when multiplying a 2D point with a 3D one.
 *
 * Examples:
 *
 * ```js
 * multiply(ptA, ptB);
 * multiply(x1, y1, x2, y2);
 * multiply(ptA, x2, y2);
 * ```
 */
export function multiply(
  a1: Point | Point3d | number, ab2: Point | Point3d | number, ab3?: number, ab4?: number, ab5?: number, ab6?: number
): Point | Point3d {
  const [ ptA, ptB ] = getTwoPointParameters(a1 as any, ab2 as any, ab3 as any, ab4 as any, ab5 as any, ab6 as any);
  guard(ptA, `a`);
  guard(ptB, `b`);
  let pt: Writeable<Point> = {
    x: ptA.x * ptB.x,
    y: ptA.y * ptB.y,
  };
  if (isPoint3d(ptA) || isPoint3d(ptB)) {
    pt.z = (ptA.z ?? 0) * (ptB.z ?? 0);
  };
  return Object.freeze(pt);
};

/**
 * Multiplies all components by `v`.
 * Existing properties of `pt` are maintained.
 *
 * ```js
 * multiplyScalar({ x:2, y:4 }, 2);
 * // Yields: { x:4, y:8 }
 * ```
 * @param pt Point
 * @param v Value to multiply by
 * @returns
 */
export const multiplyScalar = (
  pt: Point | Point3d,
  v: number
): Point | Point3d => {
  return isPoint3d(pt) ? Object.freeze({
    ...pt,
    x: pt.x * v,
    y: pt.y * v,
    z: pt.z * v,
  }) : Object.freeze({
    ...pt,
    x: pt.x * v,
    y: pt.y * v,
  });
};

