import type { Point } from "../point/PointType.js";
import { centroid } from "./Centroid.js";
import type { Triangle } from "./TriangleType.js";
import { rotate as PointsRotate } from "../point/index.js";
/**
 * Returns a triangle that is rotated by `angleRad`. By default it rotates
 * around its center but an arbitrary `origin` point can be provided.
 *
 * ```js
 * let triangle = Triangles.fromPoints([a, b, c]);
 * 
 * // Rotate triangle by 5 degrees
 * triangle = Triangles.rotate(triangle, degreeToRadian(5));
 *
 * // Rotate by 90 degrees
 * triangle = Triangles.rotate(triangle, Math.PI / 2);
 * ```
 * @param triangle Triangle to rotate
 * @param amountRadian Angle in radians to rotate by
 * @param origin Point to rotate around. If undefined, middle of triangle will be used
 * @returns A new triangle
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

/**
 * Rotates the vertices of the triangle around one point (by default, `b`), returning
 * as a new object.
 * 
 * ```js
 * let triangle = Triangles.fromPoints([a, b, c]);
 * triangle = Triangles.rotateByVertex(triangle, Math.Pi, `a`);
 * ```
 * @param triangle Triangle
 * @param amountRadian Angle to rotate by
 * @param vertex Name of vertex: a, b or c.
 * @returns A new triangle
 */
export const rotateByVertex = (
  triangle: Triangle,
  amountRadian: number,
  vertex: `a` | `b` | `c` = `b`
): Triangle => {
  const origin =
    vertex === `a` ? triangle.a : (vertex === `b` ? triangle.b : triangle.c);
  return Object.freeze({
    a: PointsRotate(triangle.a, amountRadian, origin),
    b: PointsRotate(triangle.b, amountRadian, origin),
    c: PointsRotate(triangle.c, amountRadian, origin),
  });
};