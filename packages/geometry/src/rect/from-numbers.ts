import type { RectPositioned, Rect } from "./rect-types.js";
/**
 * Returns a rectangle from width, height
 * ```js
 * const r = Rects.fromNumbers(100, 200);
 * // {width: 100, height: 200}
 * ```
 *
 * Use {@link toArray} for the opposite conversion.
 *
 * @param width
 * @param height
 */
export function fromNumbers(width: number, height: number): Rect;

/**
 * Returns a rectangle from x,y,width,height
 *
 * ```js
 * const r = Rects.fromNumbers(10, 20, 100, 200);
 * // {x: 10, y: 20, width: 100, height: 200}
 * ```
 *
 * Use the spread operator (...) if the source is an array:
 * ```js
 * const r3 = Rects.fromNumbers(...[10, 20, 100, 200]);
 * ```
 *
 * Use {@link toArray} for the opposite conversion.
 *
 * @param x
 * @param y
 * @param width
 * @param height
 */
export function fromNumbers(
  x: number,
  y: number,
  width: number,
  height: number
): RectPositioned;

/**
 * Returns a rectangle from a series of numbers: x, y, width, height OR width, height
 *
 * ```js
 * const r1 = Rects.fromNumbers(100, 200);
 * // {width: 100, height: 200}
 *
 * const r2 = Rects.fromNumbers(10, 20, 100, 200);
 * // {x: 10, y: 20, width: 100, height: 200}
 * ```
 * Use the spread operator (...) if the source is an array:
 *
 * ```js
 * const r3 = Rects.fromNumbers(...[10, 20, 100, 200]);
 * ```
 *
 * Use {@link toArray} for the opposite conversion.
 *
 * @see toArray
 * @param xOrWidth
 * @param yOrHeight
 * @param width
 * @param height
 * @returns
 */

export function fromNumbers(
  xOrWidth: number,
  yOrHeight: number,
  width?: number,
  height?: number
): Rect | RectPositioned {
  if (width === undefined || height === undefined) {
    if (typeof xOrWidth !== `number`) throw new Error(`width is not an number`);
    if (typeof yOrHeight !== `number`) {
      throw new TypeError(`height is not an number`);
    }
    return Object.freeze({ width: xOrWidth, height: yOrHeight });
  }
  if (typeof xOrWidth !== `number`) throw new Error(`x is not an number`);
  if (typeof yOrHeight !== `number`) throw new Error(`y is not an number`);
  if (typeof width !== `number`) throw new Error(`width is not an number`);
  if (typeof height !== `number`) throw new Error(`height is not an number`);

  return Object.freeze({ x: xOrWidth, y: yOrHeight, width, height });
}
