import type { Point } from "../point/point-type.js";
import type { Triangle } from "./triangle-type.js";
import { project as PointsProject } from "../point/project.js";
// import { guard as PointGuard } from "../point/Guard.js";
// import { throwNumberTest } from "@ixfx/guards";
// import { piPi } from "../pi.js";

/**
 * A triangle consisting of three empty points (Points.Empty)
 */

export const Empty = Object.freeze({
  a: { x: 0, y: 0 },
  b: { x: 0, y: 0 },
  c: { x: 0, y: 0 },
});

/**
 * A triangle consisting of three placeholder points (Points.Placeholder)
 */

export const Placeholder = Object.freeze({
  a: { x: Number.NaN, y: Number.NaN },
  b: { x: Number.NaN, y: Number.NaN },
  c: { x: Number.NaN, y: Number.NaN },
});



/**
 * Returns a triangle anchored at `origin` with a given `length` and `angleRadian`.
 * The origin will be point `b` of the triangle, and the angle will be the angle for b.
 * @param origin Origin
 * @param length Length
 * @param angleRadian Angle
 * @returns
 */
export const equilateralFromVertex = (
  origin?: Point,
  length = 10,
  angleRadian: number = Math.PI / 2
): Triangle => {
  if (!origin) origin = Object.freeze({ x: 0, y: 0 })

  const a = PointsProject(origin, length, Math.PI - -angleRadian / 2);
  const c = PointsProject(origin, length, Math.PI - angleRadian / 2);
  return { a, b: origin, c };
};