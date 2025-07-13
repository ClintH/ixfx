import type { Point } from "../point/point-type.js";
import type { RectPositioned } from "./rect-types.js";

/**
 * If `p` is inside of `rect`, a copy of `p` is returned.
 * If `p` is outside of `rect`, a point is returned closest to `p` on the edge
 * of the rectangle.
 * @param rect 
 * @param p 
 * @returns 
 */
export const nearestInternal = (rect: RectPositioned, p: Point): Point => {
  let { x, y } = p;
  if (x < rect.x) x = rect.x;
  else if (x > rect.x + rect.width) x = rect.x + rect.width;
  if (y < rect.y) y = rect.y;
  else if (y > rect.y + rect.height) y = rect.y + rect.height;
  return Object.freeze({ ...p, x, y });
}