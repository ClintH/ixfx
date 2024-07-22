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
 * @param triangle Triangle to rotate
 * @param amountRadian Angle in radians to rotate by
 * @param origin Point to rotate around. If undefined, middle of triangle will be used
 * @returns
 */
export const rotate = (
  triangle: Triangle,
  amountRadian?: number,
  origin?: Point
): Triangle => {
  if (amountRadian === undefined || amountRadian === 0) return triangle;
  if (origin === undefined) origin = centroid(triangle);
  return Object.freeze({
    ...triangle,
    a: PointsRotate(triangle.a, amountRadian, origin),
    b: PointsRotate(triangle.b, amountRadian, origin),
    c: PointsRotate(triangle.c, amountRadian, origin),
  });
};
