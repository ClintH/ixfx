import { length as LinesLength } from '../line/Length.js';

import { edges } from './Edges.js';
import { guardPositioned } from './Guard.js';
import type { RectPositioned } from './RectTypes.js';
/**
 * Returns the length of each side of the rectangle (top, right, bottom, left)
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rect = { width: 100, height: 100, x: 100, y: 100 };
 * // Yields: array of length four
 * const lengths = Rects.lengths(rect);
 * ```
 * @param rect
 * @returns
 */
export const lengths = (rect: RectPositioned): ReadonlyArray<number> => {
  guardPositioned(rect, `rect`);
  return edges(rect).map((l) => LinesLength(l));
};
