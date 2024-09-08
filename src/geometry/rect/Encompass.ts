import type { Point } from "../point/PointType.js";
import type { RectPositioned } from "./RectTypes.js";

/**
 * Returns a copy of `rect` with `rect` resized so it also encompasses `points`.
 * If provided point(s) are within bounds of `rect`, a copy of `rect` is returned.
 * @param rect 
 * @param points 
 * @returns 
 */
export const encompass = (rect: RectPositioned, ...points: Point[]): RectPositioned => {
  const x = points.map(p => p.x);
  const y = points.map(p => p.y);

  let minX = Math.min(...x, rect.x);
  let minY = Math.min(...y, rect.y);
  let maxX = Math.max(...x, rect.x + rect.width);
  let maxY = Math.max(...y, rect.y + rect.height);

  let rectW = Math.max(rect.width, maxX - minX);
  let rectH = Math.max(rect.height, maxY - minY);

  return Object.freeze({
    ...rect,
    x: minX,
    y: minY,
    width: rectW,
    height: rectH
  })
} 