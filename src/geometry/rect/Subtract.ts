import type { Rect } from "./index.js";

/**
 * Subtracts width/height of `b` from `a` (ie: a - b), returning result.
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rectA = { width: 100, height: 100 };
 * const rectB = { width: 200, height: 200 };
 *
 * // Yields: { width: -100, height: -100 }
 * Rects.subtract(rectA, rectB);
 * ```
 * @param a
 * @param b
 */
export function subtract(a: Rect, b: Rect): Rect;
/**
 * Subtracts a width/height from `a`, returning result.
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rect = { width: 100, height: 100 };
 *
 * // Yields: { width: -100, height: -100 }
 * Rects.subtract(rect, 200, 200);
 * ```
 * @param a
 * @param width
 * @param height
 */
export function subtract(a: Rect, width: number, height?: number): Rect;

/**
 * Subtracts width/height from `a`.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rectA = { width: 100, height: 100 };
 * const rectB = { width: 200, height: 200 };
 *
 * // Yields: { width: -100, height: -100 }
 * Rects.subtract(rectA, rectB);
 * Rects.subtract(rectA, 200, 200);
 * ```
 * @param a
 * @param b
 * @param c
 * @returns
 */
//eslint-disable-next-line func-style
export function subtract(a: Rect | undefined, b: Rect | number, c?: number): Rect {
  if (a === undefined) throw new Error(`First parameter undefined`);
  if (typeof b === `number`) {
    const height = c ?? 0;
    return Object.freeze({
      ...a,
      width: a.width - b,
      height: a.height - height,
    });
  } else {
    return Object.freeze({
      ...a,
      width: a.width - b.width,
      height: a.height - b.height,
    });
  }
}
