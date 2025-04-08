import { getTwoPointParameters } from "./get-point-parameter.js";
import { guard, isPoint3d } from "./guard.js";
import type { Point, Point3d } from "./point-type.js";
import type { Writeable } from "@ixfxfun/core";

export function subtract(a: Point, b: Point): Point;
export function subtract(a: Point3d, b: Point3d): Point3d;
export function subtract(a: Point, x: number, y: number): Point;
export function subtract(a: Point3d, x: number, y: number, z: number): Point3d;
export function subtract(ax: number, ay: number, bx: number, by: number): Point;
export function subtract(ax: number, ay: number, az: number, bx: number, by: number, bz: number): Point3d;

/**
 * Returns a Point with the x,y,z values of two points subtracted (a-b).
 * 
 * `z` parameter is used if present. Uses a default value of 0 for 'z' when subtracting a 2D point with a 3D one.
 *
 * Examples:
 *
 * ```js
 * subtract(ptA, ptB);
 * subtract(x1, y1, x2, y2);
 * subtract(ptA, x2, y2);
 * ```
 */
export function subtract(
  a1: Point | Point3d | number, ab2: Point | Point3d | number, ab3?: number, ab4?: number, ab5?: number, ab6?: number
): Point | Point3d {
  const [ ptA, ptB ] = getTwoPointParameters(a1 as any, ab2 as any, ab3 as any, ab4 as any, ab5 as any, ab6 as any);
  guard(ptA, `a`);
  guard(ptB, `b`);
  let pt: Writeable<Point> = {
    x: ptA.x - ptB.x,
    y: ptA.y - ptB.y,
  };
  if (isPoint3d(ptA) || isPoint3d(ptB)) {
    pt.z = (ptA.z ?? 0) - (ptB.z ?? 0);
  };
  return Object.freeze(pt);
};
