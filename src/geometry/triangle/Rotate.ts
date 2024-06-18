import type { Point } from "../point/PointType.js";
import { centroid } from "./Centroid.js";
import type { Triangle } from "./TriangleType.js";
import { rotate as PointsRotate } from "../point/index.js";
/**
 * Returns a triangle that is rotated by `angleRad`. By default it rotates
 * around its center but an arbitrary `origin` point can be provided.
 *
 * ```js
 * // Rotate triangle by 5 degrees
 * rotate(triangle, degreeToRadian(5));
 *
 * // Rotate by 90 degrees
 * rotate(triangle, Math.PI / 2);
 * ```
 * @param line Line to rotate
 * @param amountRadian Angle in radians to rotate by
 * @param origin Point to rotate around. If undefined, middle of line will be used
 * @returns
 */
export const rotate = (
  t: Triangle,
  amountRadian?: number,
  origin?: Point
): Triangle => {
  if (amountRadian === undefined || amountRadian === 0) return t;
  if (origin === undefined) origin = centroid(t);
  return Object.freeze({
    ...t,
    a: PointsRotate(t.a, amountRadian, origin),
    b: PointsRotate(t.b, amountRadian, origin),
    c: PointsRotate(t.c, amountRadian, origin),
  });
};
