import type { Point, CirclePositioned } from "../Types.js";
import { distanceCenter } from "./DistanceCenter.js";
import { isPoint as PointsIsPoint, distance as PointsDistance } from "../points/index.js";
import { guardPositioned, isCirclePositioned } from "./Guard.js";

/**
 * Returns the distance between the exterior of two circles, or between the exterior of a circle and point.
 * If `b` overlaps or is enclosed by `a`, distance is 0.
 * 
 * ```js
 * import { Circles } from "https://unpkg.com/ixfx/dist/geometry.js" 
 * const circleA = { radius: 5, x: 5, y: 5 }
 * const circleB = { radius: 10, x: 20, y: 20 }
 * const distance = Circles.distanceCenter(circleA, circleB);
 * ```
 * @param a
 * @param b 
 */
export const distanceFromExterior = (a: CirclePositioned, b: CirclePositioned | Point): number => {
  guardPositioned(a, `a`);
  if (isCirclePositioned(b)) {
    return Math.max(0, distanceCenter(a, b) - a.radius - b.radius);
  } else if (PointsIsPoint(b)) {
    const distribution = PointsDistance(a, b);
    if (distribution < a.radius) return 0;
    return distribution;
  } else throw new Error(`Second parameter invalid type`);
};