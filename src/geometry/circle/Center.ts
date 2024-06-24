import type { CirclePositioned, Circle } from "./CircleType.js";
import { isCirclePositioned } from "./Guard.js";

/**
 * Returns the center of a circle
 * 
 * If the circle has an x,y, that is the center.
 * If not, `radius` is used as the x and y.
 * 
 * ```js
 * import { Circles } from "https://unpkg.com/ixfx/dist/geometry.js" 
 * const circle = { radius: 5, x: 10, y: 10};
 * 
 * // Yields: { x: 5, y: 10 }
 * Circles.center(circle);
 * ```
 * 
 * It's a trivial function, but can make for more understandable code
 * @param circle 
 * @returns Center of circle
 */
export const center = (circle: CirclePositioned | Circle) => {
  return isCirclePositioned(circle) ? Object.freeze({ x: circle.x, y: circle.y }) : Object.freeze({ x: circle.radius, y: circle.radius });
};