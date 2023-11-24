import type { Point } from "bezier-js";
import { guardPositioned } from "./Guard.js";
import { intersectsPoint } from "./Intersects.js";
import { center } from "./index.js";
import type { RectPositioned } from "../Types.js";
import { guard as PointsGuard } from '../points/Guard.js';

import { distance as PointsDistance } from '../points/index.js';

/**
 * Returns the distance from the perimeter of `rect` to `pt`.
 * If the point is within the rectangle, 0 is returned.
 *
 * If `rect` does not have an x,y it's assumed to be 0,0
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rect = { width: 100, height: 100, x: 0, y: 0 };
 * Rects.distanceFromExterior(rect, { x: 20, y: 20 });
 * ```
 * @param rect Rectangle
 * @param pt Point
 * @returns Distance
 */
export const distanceFromExterior = (
  rect: RectPositioned,
  pt: Point
): number => {
  guardPositioned(rect, `rect`);
  PointsGuard(pt, `pt`);
  if (intersectsPoint(rect, pt)) return 0;
  const dx = Math.max(rect.x - pt.x, 0, pt.x - rect.x + rect.width);
  const dy = Math.max(rect.y - pt.y, 0, pt.y - rect.y + rect.height);
  return Math.hypot(dx, dy);
};

/**
 * Return the distance of `pt` to the center of `rect`.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rect = { width: 100, height: 100, x: 0, y: 0 };
 * Rects.distanceFromCenter(rect, { x: 20, y: 20 });
 * ```
 * @param rect
 * @param pt
 * @returns
 */
export const distanceFromCenter = (
  rect: RectPositioned,
  pt: Point
): number => PointsDistance(center(rect), pt);