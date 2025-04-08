import type { RectPositioned, Rect } from "./rect-types.js";
import { applyMerge, applyDim, applyScalar } from "./Apply.js";

const multiplyOp = (a: number, b: number) => a * b;


/**
 * Multiplies positioned `rect` by width/height. Useful for denormalising a value.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * // Normalised rectangle
 * const r = { x:0.5, y:0.5, width: 0.5, height: 0.5};
 *
 * // Map to window:
 * const rr = Rects.multiply(r, window.innerWidth, window.innerHeight);
 * ```
 *
 * Multiplication applies to the first parameter's x/y fields.
 */
export function multiply(
  rect: RectPositioned,
  width: number,
  height?: number
): RectPositioned;

/**
 * Multiplies `rect` by width/height. Useful for denormalising a value.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * // Normalised rectangle of width 50%, height 50%
 * const r = { width: 0.5, height: 0.5 };
 *
 * // Map to window:
 * const rr = Rects.multiply(r, window.innerWidth, window.innerHeight);
 * ```
 *
 * Multiplication applies to the first parameter's x/y fields, if present.
 */
export function multiply(rect: Rect, width: number, height: number): Rect;

/**
 * Multiplies positioned rect `a` by width and height of rect `b`.
 * ```js
 * // Returns {width: someRect.width * someOtherRect.width ...}
 * Rects.multiply(someRect, someOtherRect);
 * ```
 *
 * @param a 
 * @param b 
 */
export function multiply(a: RectPositioned, b: Rect): RectPositioned;

/**
 * Multiplies rect `a` by width and height of rect `b`.
 * 
 * ```js
 * // Returns {width: someRect.width * someOtherRect.width ...}
 * Rects.multiply(someRect, someOtherRect);
 * ```
 *
 * @param a 
 * @param b 
 */
export function multiply(a: Rect, b: Rect): Rect;

/**
 * @internal
 * @param a 
 * @param b 
 * @param c 
 * @returns 
 */
export function multiply(
  a: RectPositioned | Rect,
  b: Rect | number,
  c?: number
): RectPositioned | Rect {
  // @ts-ignore
  return applyMerge(multiplyOp, a, b, c) as RectPositioned | Rect;
}


/**
 * Multiplies all components of `rect` by `amount`.
 * ```js
 * multiplyScalar({ width:10, height:20 }, 2); // { width:20, height: 40 }
 * ```
 * @param rect
 * @param amount
 */
export function multiplyScalar(rect: Rect, amount: number): Rect;

/**
 * Multiplies all components of `rect` by `amount`.
 * This includes x,y if present.
 * 
 * ```js
 * multiplyScalar({ width:10, height:20 }, 2); // { width:20, height: 40 }
 * multiplyScalar({ x: 1, y: 2, width:10, height:20 }, 2); // { x: 2, y: 4, width:20, height: 40 }
 * ```
 * @param rect
 * @param amount
 */
export function multiplyScalar(
  rect: RectPositioned,
  amount: number
): RectPositioned;

/**
 * Multiplies all components of `rect` by `amount`.
 * This includes x,y if present.
 * 
 * ```js
 * multiplyScalar({ width:10, height:20 }, 2); // { width:20, height: 40 }
 * multiplyScalar({ x: 1, y: 2, width:10, height:20 }, 2); // { x: 2, y: 4, width:20, height: 40 }
 * ```
 * 
 * Use {@link multiplyDim} to only multiply width & height.
 * @param rect
 * @param amount
 */
export function multiplyScalar(
  rect: Rect | RectPositioned,
  amount: number
): Rect | RectPositioned {
  return applyScalar(multiplyOp, rect, amount);
  // return isPositioned(rect) ? Object.freeze({
  //   ...rect,
  //   x: rect.x * amount,
  //   y: rect.y * amount,
  //   width: rect.width * amount,
  //   height: rect.height * amount,
  // }) : Object.freeze({
  //   ...rect,
  //   width: rect.width * amount,
  //   height: rect.height * amount,
  // });
}


/**
 * Multiplies only the width/height of `rect`, leaving `x` and `y` as they are.
 * ```js
 * multiplyDim({ x:1,y:2,width:3,height:4 }, 2);
 * // Yields: { x:1, y:2, width:6, height: 8 }
 * ```
 * 
 * In comparison, {@link multiply} will also include x & y.
 * @param rect Rectangle
 * @param amount Amount to multiply by
 * @returns 
 */
export function multiplyDim(
  rect: Rect | RectPositioned,
  amount: number
): Rect | RectPositioned {
  return applyDim(multiplyOp, rect, amount);
  // return isPositioned(rect) ? Object.freeze({
  //   ...rect,
  //   x: rect.x * amount,
  //   y: rect.y * amount,
  //   width: rect.width * amount,
  //   height: rect.height * amount,
  // }) : Object.freeze({
  //   ...rect,
  //   width: rect.width * amount,
  //   height: rect.height * amount,
  // });
}
