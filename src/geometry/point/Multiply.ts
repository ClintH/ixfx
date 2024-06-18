import { throwNumberTest } from "../../util/GuardNumbers.js";
import { isRect } from "../rect/Guard.js";
import type { Rect } from "../rect/RectTypes.js";
import { guard as RectsGuard } from '../rect/Guard.js'
import type { Point, Point3d } from "./PointType.js";
import { guard, isPoint, isPoint3d } from "./Guard.js";

/**
 * Multiply by a width,height or x,y
 * ```
 * return {
 *  x: a.x * rect.width,
 *  y: a.y * rect.height
 * };
 * ```
 * @param a
 * @param rectOrPoint
 */
export function multiply(a: Point, rectOrPoint: Rect | Point): Point;

/**
 * Returns `a` multipled by some x and/or y scaling factor
 *
 * ie.
 * ```js
 * return {
 *  x: a.x * x
 *   y: a.y * y
 * }
 * ```
 *
 * Usage:
 * ```js
 * multiply(pt, 10, 100); // Scale pt by x:10, y:100
 * multiply(pt, Math.min(window.innerWidth, window.innerHeight)); // Scale both x,y by viewport with or height, whichever is smaller
 * ```
 * @export
 * @parama Point to scale
 * @param x Scale factor for x axis
 * @param [y] Scale factor for y axis (if not specified, the x value is used)
 * @returns Scaled point
 */
export function multiply(a: Point, x: number, y?: number): Point;

/**
 * Returns `a` multiplied by `b` point, or given x and y.
 * ie.
 * ```js
 * return {
 *   x: a.x * b.x,
 *   y: a.y * b.y
 * };
 * ```
 * @param a
 * @param bOrX
 * @param y
 * @returns
 */
/* eslint-disable func-style */
export function multiply(
  a: Point,
  bOrX: Rect | Point | number,
  y?: number
): Point {
  // ✔️ Unit tested

  guard(a, `a`);
  if (typeof bOrX === `number`) {
    if (typeof y === `undefined`) y = bOrX;
    throwNumberTest(y, ``, `y`);
    throwNumberTest(bOrX, ``, `x`);
    return Object.freeze({ x: a.x * bOrX, y: a.y * y });
  } else if (isPoint(bOrX)) {
    guard(bOrX, `b`);
    return Object.freeze({
      x: a.x * bOrX.x,
      y: a.y * bOrX.y,
    });
  } else if (isRect(bOrX)) {
    RectsGuard(bOrX, `rect`);
    return Object.freeze({
      x: a.x * bOrX.width,
      y: a.y * bOrX.height,
    });
  } else {
    throw new Error(
      `Invalid arguments. a: ${ JSON.stringify(a) } b: ${ JSON.stringify(bOrX) }`
    );
  }
}

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

