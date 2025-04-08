import { distanceFromExterior as circleDistanceFromExterior } from "../circle/distance-from-exterior.js";
import { distance } from "./distance.js";
import { isPoint } from "./guard.js";
import { distanceFromExterior as rectDistanceFromExterior } from "../rect/distance.js";
import type { Point } from "./point-type.js";
import { isCirclePositioned } from "../circle/guard.js";
import { isRectPositioned } from "../rect/Guard.js";
import type { PointCalculableShape } from "../shape/index.js";

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