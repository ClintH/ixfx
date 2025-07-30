import { type Point } from "../point/point-type.js";
import { getRectPositioned } from "./guard.js";
import type { Rect, RectPositioned } from "./rect-types.js";

/**
 * Returns the four corners of a rectangle as an array of Points.
 *
 * ```js
 * const rect = { width: 100, height: 100, x: 0, y: 0};
 * const pts = Rects.corners(rect);
 * ```
 *
 * If the rectangle is not positioned, is origin can be provided.
 * Order of corners: ne, nw, sw, se
 * @param rect
 * @param origin
 * @returns
 */
export const corners = (
  rect: RectPositioned | Rect,
  origin?: Point
): readonly Point[] => {
  const r = getRectPositioned(rect, origin);
  return [
    { x: r.x, y: r.y },
    { x: r.x + r.width, y: r.y },
    { x: r.x + r.width, y: r.y + r.height },
    { x: r.x, y: r.y + r.height },
  ];
};