import { apply } from "./Apply.js";
import { getRectPositioned, isPositioned } from "./Guard.js";
import type { Rect, RectPositioned } from "./RectTypes.js";

const sumOp = (a: number, b: number) => a + b;
/**
 * Sums width/height of `b` with `a` (ie: a + b), returning result.
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rectA = { width: 100, height: 100 };
 * const rectB = { width: 200, height: 200 };
 *
 * // Yields: { width: 300, height: 300 }
 * Rects.sum(rectA, rectB);
 * ```
 * @param a
 * @param b
 */
export function sum(a: Rect, b: Rect): Rect;

/**
 * Sums width/height of `b` with `a`, returning result.
 * 
 * Note that width/height of `b` is also added to `a`'s x & y properties
 * ```js
 * // Yields: { x:101, y:202, width: 110, height: 220 }
 * sum({x:1, y:2, width:10, height:20}, {width:100, height: 200});
 * ```
 * 
 * x & y values of `b` are ignored. If you want to sum with those, use `sumOffset`
 * @param a 
 * @param b 
 */
export function sum(a: RectPositioned, b: Rect): RectPositioned;

/**
 * Sums width/height of `rect` with given `width` and `height`
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rect = { width: 100, height: 100 };
 *
 * // Yields: { width: 300, height: 300 }
 * Rects.subtract(rect, 200, 200);
 * ```
 * @param rect
 * @param width
 * @param height
 */
export function sum(rect: Rect, width: number, height: number): Rect;

/**
 * Sums width/height of `rect` with `width` and `height`
 * 
 * `width` and `height` is added to `rect`'s `x` and `y` values.
 * ```js
 * // Yields: { x:101, y:202, width: 110, height: 220 }
 * sum({x:1, y:2, width:10, height:20}, 100, 200);
 * ```
 * @param rect
 * @param width
 * @param height
 */
export function sum(rect: RectPositioned, width: number, height: number): RectPositioned;

/**
 * Sums width/height of `b` with `a` (ie: a + b), returning result.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const rectA = { width: 100, height: 100 };
 * const rectB = { width: 200, height: 200 };
 *
 * // Yields: { width: 300, height: 300 }
 * Rects.sum(rectA, rectB);
 * Rects.sum(rectA, 200, 200);
 * ```
 * @param a
 * @param b
 * @param c
 * @returns
 */
//eslint-disable-next-line func-style
export function sum(a: Rect, b: Rect | number, c?: number): Rect {
  // @ts-ignore
  return apply(sumOp, a, b, c);
}

/**
 * Sums x,y,width,height of a+b.
 * ```js
 * sumOffset({x:100,y:100,width:100,height:100}, {x:10, y:20, width: 30, height: 40});
 * // Yields: {x: 110, y: 120, width: 130, height: 140 }
 * ```
 * If either `a` or `b` are missing x & y, 0 is used
 * @param a 
 * @param b 
 * @returns 
 */
export function sumOffset(a: RectPositioned | Rect, b: RectPositioned | Rect): RectPositioned {
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
    x: x + xB,
    y: y + yB,
    width: a.width + b.width,
    height: a.height + b.height
  })
}