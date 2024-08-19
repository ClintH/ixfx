import type { RectPositioned, Rect } from "./RectTypes.js";
import { apply, applyDim, applyScalar } from "./Apply.js";

const divideOp = (a: number, b: number) => a / b;

/**
 * Divides positioned `rect` by width/height. Useful for normalising a value.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * // Normalise based on window size
 * const r = { x: 10, y: 200, width: 100, height: 30 };
 * const rr = Rects.divide(r, window.innerWidth, window.innerHeight);
 * ```
 *
 * Division applies to the first parameter's x/y fields. X is affected by `width`, Y is affected by `height`.
 */
export function divide(
  rect: RectPositioned,
  width: number,
  height?: number
): RectPositioned;

/**
 * Divides `rect` by width/height. Useful for denormalising a value.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * // Normalise based on window size
 * const r = { width: 100, height: 30 };
 * const rr = Rects.divide(r, window.innerWidth, window.innerHeight);
 * ```
 *
 */
export function divide(rect: Rect, width: number, height: number): Rect;

/**
 * Divides positioned rect `a` by width and height of rect `b`.
 * ```js
 * // Returns { ...a, width: a.width / b.width, height: a.height/b.height, x: a.x / b.width, y: a.y / b.height }
 * Rects.divide(a, b);
 * ```
 *
 * @param a 
 * @param b 
 */
export function divide(a: RectPositioned, b: Rect): RectPositioned;

/**
 * Divides rect `a` by width and height of rect `b`.
 * 
 * ```js
 * // Returns {...a, width: a.width / b.width, height: a.height/b.height }
 * Rects.divide(a, b);
 * ```
 *
 * @param a 
 * @param b 
 */
export function divide(a: Rect, b: Rect): Rect;

/**
 * @internal
 * @param a 
 * @param b 
 * @param c 
 * @returns 
 */
export function divide(
  a: RectPositioned | Rect,
  b: Rect | number,
  c?: number
): RectPositioned | Rect {
  // @ts-ignore
  return apply(divideOp, a, b, c) as RectPositioned | Rect;
}


/**
 * Divides all components of `rect` by `amount`.
 * ```js
 * divideScalar({ width:10, height:20 }, 2); // { width:5, height: 10 }
 * ```
 * @param rect
 * @param amount
 */
export function divideScalar(rect: Rect, amount: number): Rect;

/**
 * Divides all components of `rect` by `amount`.
 * This includes x,y if present.
 * 
 * ```js
 * divideScalar({ width:10, height:20 }, 2); // { width:5, height: 10 }
 * divideScalar({ x: 1, y: 2, width:10, height:20 }, 2); // { x: 0.5, y: 1, width:5, height: 10 }
 * ```
 * @param rect
 * @param amount
 */
export function divideScalar(
  rect: RectPositioned,
  amount: number
): RectPositioned;

/**
 * Divides all components of `rect` by `amount`.
 * This includes x,y if present.
 * 
 * ```js
 * divideScalar({ width:10, height:20 }, 2); // { width:5, height: 10 }
 * divideScalar({ x: 1, y: 2, width:10, height:20 }, 2); // { x: 0.5, y: 1, width:5, height: 10 }
 * ```
 * @param rect
 * @param amount
 */
export function divideScalar(
  rect: Rect | RectPositioned,
  amount: number
): Rect | RectPositioned {
  return applyScalar(divideOp, rect, amount);
}

export function divideDim(
  rect: Rect | RectPositioned,
  amount: number
): Rect | RectPositioned {
  return applyDim(divideOp, rect, amount);
}
