import { applyMerge } from "./Apply.js";
import { isPositioned } from "./Guard.js";
import type { Rect, RectPositioned } from "./RectTypes.js";

const subtractOp = (a: number, b: number) => a - b;

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
export function subtract(a: RectPositioned, b: Rect): RectPositioned;

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
export function subtract(a: Rect, width: number, height: number): Rect;

export function subtract(a: RectPositioned, width: number, height: number): RectPositioned;
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
export function subtract(a: Rect | undefined, b: Rect | number, c?: number): Rect {
  // @ts-ignore
  return applyMerge(subtractOp, a, b, c);
}

/**
 * Subtracts x,y,width,height of a-b.
 * ```js
 * subtractOffset({x:100,y:100,width:100,height:100}, {x:10, y:20, width: 30, height: 40});
 * // Yields: {x: 90, y: 80, width: 70, height: 60 }
 * ```
 * If either `a` or `b` are missing x & y, 0 is used
 * @param a 
 * @param b 
 * @returns 
 */
export function subtractOffset(a: RectPositioned | Rect, b: RectPositioned | Rect): RectPositioned {
  let x = 0;
  let y = 0;
  if (isPositioned(a)) {
    x = a.x;
    y = a.y;
  }
  let xB = 0;
  let yB = 0;
  if (isPositioned(b)) {
    xB = b.x;
    yB = b.y;
  }
  return Object.freeze({
    ...a,
    x: x - xB,
    y: y - yB,
    width: a.width - b.width,
    height: a.height - b.height
  })
}