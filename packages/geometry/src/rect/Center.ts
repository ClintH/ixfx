import { isPoint } from "../point/guard.js";
import type { Point } from "../point/point-type.js";
import { getRectPositioned, guard } from "./guard.js";
import type { Rect, RectPositioned } from "./rect-types.js";

/**
 * Returns the center of a rectangle as a {@link Point}.
 *  If the rectangle lacks a position and `origin` parameter is not provided, 0,0 is used instead.
 *
 * ```js
 * const p = Rects.center({x:10, y:20, width:100, height:50});
 * const p2 = Rects.center({width: 100, height: 50}); // Assumes 0,0 for rect x,y
 * ```
 * @param rect Rectangle
 * @param origin Optional origin. Overrides `rect` position if available. If no position is available 0,0 is used by default.
 * @returns
 */
export const center = (
  rect: RectPositioned | Rect,
  origin?: Point
): Point => {
  guard(rect);
  if (origin === undefined && isPoint(rect)) origin = rect;
  else if (origin === undefined) origin = { x: 0, y: 0 }; // throw new Error(`Unpositioned rect needs origin param`);

  const r = getRectPositioned(rect, origin);
  return Object.freeze({
    x: origin.x + rect.width / 2,
    y: origin.y + rect.height / 2,
  });
};