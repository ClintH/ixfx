import type { CirclePositioned } from "./circle-type.js";
import { distance } from "../point/distance.js";
import type { Point } from '../point/point-type.js';

/**
 * Returns all integer points contained within `circle`.
 * 
 * ```js
 * const c = { x:100, y:100, radius:100 };
 * for (const pt of Circles.interiorIntegerPoints(c)) {
 *   ctx.fillRect(pt.x, pt.y, 1, 1);
 * }
 * ```
 * @param circle 
 */
export function* interiorIntegerPoints(circle: CirclePositioned): IterableIterator<Point> {
  const xMin = circle.x - circle.radius;
  const xMax = circle.x + circle.radius;
  const yMin = circle.y - circle.radius;
  const yMax = circle.y + circle.radius;
  for (let x = xMin; x < xMax; x++) {
    for (let y = yMin; y < yMax; y++) {
      const r = Math.abs(distance(circle, x, y));
      if (r <= circle.radius) yield { x, y };
    }
  }
}