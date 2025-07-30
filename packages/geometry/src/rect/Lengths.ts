import { length as LinesLength } from '../line/length.js';

import { edges } from './edges.js';
import { guardPositioned } from './guard.js';
import type { RectPositioned } from './rect-types.js';
/**
 * Returns the length of each side of the rectangle (top, right, bottom, left)
 *
 * ```js
 * const rect = { width: 100, height: 100, x: 100, y: 100 };
 * // Yields: array of length four
 * const lengths = Rects.lengths(rect);
 * ```
 * @param rect
 * @returns
 */
export const lengths = (rect: RectPositioned): readonly number[] => {
  guardPositioned(rect, `rect`);
  return edges(rect).map((l) => LinesLength(l));
};
