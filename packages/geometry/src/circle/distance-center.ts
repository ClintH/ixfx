import type { CirclePositioned } from "./circle-type.js";
import { distance as pointsDistance } from '../point/distance.js';
import { guardPositioned, isCirclePositioned } from "./guard.js";
import type { Point } from '../point/point-type.js';

/**
 * Returns the distance between two circle centers.
 * 
 * ```js
 * import { Circles } from "https://unpkg.com/ixfx/dist/geometry.js" 
 * const circleA = { radius: 5, x: 5, y: 5 }
 * const circleB = { radius: 10, x: 20, y: 20 }
 * const distance = Circles.distanceCenter(circleA, circleB);
 * ```
 * Throws an error if either is lacking position.
 * @param a 
 * @param b 
 * @returns Distance
 */
export const distanceCenter = (a: CirclePositioned, b: CirclePositioned | Point): number => {
  guardPositioned(a, `a`);
  if (isCirclePositioned(b)) {
    guardPositioned(b, `b`);
  }
  return pointsDistance(a, b);
};
