import { isCirclePositioned, distanceFromExterior as circleDistanceFromExterior } from "../Circle.js";
import { distance, isPoint } from "./index.js";
import type { Point } from "./Types.js";
import { isRectPositioned, distanceFromExterior as rectDistanceFromExterior } from "../Rect.js";
import type { PointCalculableShape } from "../Types.js";

/**
 * Returns the distance from point `a` to the center of `shape`.
 * @param a Point
 * @param shape Point, or a positioned Rect or Circle.
 * @returns
 */
export const distanceToCenter = (
  a: Point,
  shape: PointCalculableShape
): number => {
  if (isRectPositioned(shape)) {
    return rectDistanceFromExterior(shape, a);
  }
  if (isCirclePositioned(shape)) {
    return circleDistanceFromExterior(shape, a);
  }
  if (isPoint(shape)) return distance(a, shape);
  throw new Error(`Unknown shape`);
};