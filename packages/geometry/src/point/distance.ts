import { guard, isPoint3d } from "./guard.js";
import type { Point, Point3d } from './point-type.js';
import { getPointParameter } from "./get-point-parameter.js";

export function distance(a: Point, b?: Point): number;
export function distance(a: Point, x: number, y: number): number;

/**
 * Calculate distance between two points.
 * If both points have a `z` property, the distance is 3D distance is calculated.
 * If only one point has a `z`, it is ignored. To force 2D distance, use {@link distance2d}
 *
 * ```js
 * // Distance between two points
 * const ptA = { x: 0.5, y:0.8 };
 * const ptB = { x: 1, y: 0.4 };
 * distance(ptA, ptB);
 * // Or, provide x,y as parameters
 * distance(ptA, 0.4, 0.9);
 *
 * // Distance from ptA to x: 0.5, y:0.8, z: 0.1
 * const ptC = { x: 0.5, y:0.5, z: 0.3 };
 * // With x,y,z as parameters:
 * distance(ptC, 0.5, 0.8, 0.1);
 * ```
 * @param a First point
 * @param xOrB Second point, or x coord
 * @param y y coord, if x coord is given
 * @param z Optional z coord, if x and y are given.
 * @returns
 */
export function distance(
  a: Point | Point3d,
  xOrB?: Point | Point3d | number,
  y?: number,
  z?: number
): number {
  const pt = getPointParameter(xOrB, y, z);
  guard(pt, `b`);
  guard(a, `a`);
  return isPoint3d(pt) && isPoint3d(a) ? Math.hypot(pt.x - a.x, pt.y - a.y, pt.z - a.z) : Math.hypot(pt.x - a.x, pt.y - a.y);
}

/**
 * As {@distance} but always compares by x,y only.
 * @param a
 * @param xOrB 
 * @param y 
 * @param z 
 * @returns 
 */
export function distance2d(
  a: Point,
  xOrB?: Point | number,
  y?: number
): number {
  const pt = getPointParameter(xOrB, y);
  guard(pt, `b`);
  guard(a, `a`);
  return Math.hypot(pt.x - a.x, pt.y - a.y);
}
