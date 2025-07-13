import { isPoint } from "../point/guard.js";
import { distanceCenter } from "./distance-center.js";
import { isCircle } from "./guard.js";
import type { CirclePositioned } from "./circle-type.js";
import type { Point } from '../point/point-type.js';

/**
 * Returns true if `b` is completely contained by `a`
 *
 * ```js
 * // Compare two points
 * isContainedBy(circleA, circleB);
 * 
 * // Compare a circle with a point
 * isContainedBy(circleA, {x: 10, y: 20});
 * 
 * // Define radius as third parameter
 * isContainedBy(circleA, {x: 10, y: 20}, 20);
 * ```
 * @param a Circle
 * @param b Circle or point to compare to
 * @param c Radius to accompany parameter b if it's a point
 * @returns
 */
export const isContainedBy = (a: CirclePositioned, b: CirclePositioned | Point, c?: number): boolean => {
  const d = distanceCenter(a, b);
  if (isCircle(b)) {
    return (d < Math.abs(a.radius - b.radius));
  } else if (isPoint(b)) {
    // eslint-disable-next-line unicorn/prefer-ternary
    if (c === undefined) {
      return d <= a.radius;
    } else {
      // Defining a circle
      return (d < Math.abs(a.radius - c));
    }
  } else throw new Error(`b parameter is expected to be CirclePositioned or Point`);
};
