import type { Circle, CirclePositioned } from "./circle-type.js";
import { isCirclePositioned } from "./guard.js";

/**
 * Returns true if the two objects have the same values
 *
 * ```js
 * const circleA = { radius: 10, x: 5, y: 5 };
 * const circleB = { radius: 10, x: 5, y: 5 };
 * 
 * circleA === circleB; // false, because identity of objects is different
 * Circles.isEqual(circleA, circleB); // true, because values are the same
 * ```
 * 
 * Circles must both be positioned or not.
 * @param a
 * @param b
 * @returns
 */
export const isEqual = (a: CirclePositioned | Circle, b: CirclePositioned | Circle): boolean => {
  if (a.radius !== b.radius) return false;

  if (isCirclePositioned(a) && isCirclePositioned(b)) {
    if (a.x !== b.x) return false;
    if (a.y !== b.y) return false;
    if (a.z !== b.z) return false;
    return true;
  } else if (!isCirclePositioned(a) && !isCirclePositioned(b)) {
    return true; // both non-positioned, radii matched
  } else return false; // one is positioned one not

  return false;
};