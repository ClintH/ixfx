import { guard } from "./guard.js";
import type { Rect } from "./rect-types.js";

/**
 * Returns the perimeter of `rect` (ie. sum of all edges)
 *  * ```js
 * const rect = { width: 100, height: 100, x: 100, y: 100 };
 * Rects.perimeter(rect);
 * ```
 * @param rect
 * @returns
 */
export const perimeter = (rect: Rect): number => {
  guard(rect);
  return rect.height + rect.height + rect.width + rect.width;
};
