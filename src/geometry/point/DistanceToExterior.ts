import { distanceFromExterior as circleDistanceFromExterior } from "../circle/DistanceFromExterior.js";
import { distance, isPoint } from "./index.js";
import type { Point, PointCalculableShape } from "../Types.js";
import { distanceFromExterior as rectDistanceFromExterior } from "../rect/Distance.js";
import { isCirclePositioned } from "../circle/Guard.js";
import { isRectPositioned } from "../rect/Guard.js";

/**
 * Returns the distance from point `a` to the exterior of `shape`.
 *
 * @example Distance from point to rectangle
 * ```
 * const distance = distanceToExterior(
 *  {x: 50, y: 50},
 *  {x: 100, y: 100, width: 20, height: 20}
 * );
 * ```
 *
 * @example Find closest shape to point
 * ```
 * import {minIndex} from '../data/arrays.js';
 * const shapes = [ some shapes... ]; // Shapes to compare against
 * const pt = { x: 10, y: 10 };       // Comparison point
 * const distances = shapes.map(v => distanceToExterior(pt, v));
 * const closest = shapes[minIndex(...distances)];
 * ```
 * @param a Point
 * @param shape Point, or a positioned Rect or Circle.
 * @returns
 */
export const distanceToExterior = (
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