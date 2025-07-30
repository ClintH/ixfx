import { guard } from "./guard.js";
import type { Rect } from "./rect-types.js";

/**
 * Returns the area of `rect`
 *
 * ```js
 * const rect = { width: 100, height: 100, x: 100, y: 100 };
 * Rects.area(rect);
 * ```
 * @param rect
 * @returns
 */
export const area = (rect: Rect): number => {
  guard(rect);
  return rect.height * rect.width;
};