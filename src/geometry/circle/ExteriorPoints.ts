import type { CirclePositioned, Point } from "../Types.js";


/**
 * Yields the points making up the exterior (ie. circumference) of the circle.
 * Uses [Midpoint Circle Algorithm](http://en.wikipedia.org/wiki/Midpoint_circle_algorithm)
 * 
 * @example Draw outline of circle
 * ```js
 * const circle = { x: 100, y: 100, radius: 50 }
 * for (const pt of Circles.exteriorIntegerPoints(circle)) {
 *  // Fill 1x1 pixel
 *  ctx.fillRect(pt.x, pt.y, 1, 1);
 * }
 * ```
 * @param circle 
 */
export function* exteriorIntegerPoints(circle: CirclePositioned): IterableIterator<Point> {
  const { x, y, radius } = circle;

  let xx = radius;
  let yy = 0;
  let radiusError = 1 - x;
  while (xx >= yy) {
    yield { x: xx + x, y: yy + y };
    yield { x: yy + x, y: xx + y };
    yield { x: -xx + x, y: yy + y };
    yield { x: -yy + x, y: xx + y };
    yield { x: -xx + x, y: -yy + y };
    yield { x: -yy + x, y: -xx + y };
    yield { x: xx + x, y: -yy + y };
    yield { x: yy + x, y: -xx + y }
    yy++;
    if (radiusError < 0) {
      radiusError += 2 * yy + 1;
    } else {
      xx--;
      radiusError += 2 * (yy - xx + 1);
    }
  }
}

