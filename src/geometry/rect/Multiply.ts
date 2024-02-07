import { guard } from "./Guard.js";
import type { RectPositioned, Rect } from "./index.js";
import { isRect, isRectPositioned, isPositioned } from "./Guard.js";

/**
 * Multiplies `a` by rectangle or width/height. Useful for denormalising a value.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * // Normalised rectangle of width 50%, height 50%
 * const r = {width: 0.5, height: 0.5};
 *
 * // Map to window:
 * const rr = Rects.multiply(r, window.innerWidth, window.innerHeight);
 * ```
 *
 * ```js
 * // Returns {width: someRect.width * someOtherRect.width ...}
 * Rects.multiply(someRect, someOtherRect);
 *
 * // Returns {width: someRect.width * 100, height: someRect.height * 200}
 * Rects.multiply(someRect, 100, 200);
 * ```
 *
 * Multiplication applies to the first parameter's x/y fields, if present.
 */
export function multiply(
  a: RectPositioned,
  b: Rect | number,
  c?: number
): RectPositioned;

/**
 * Multiplies `a` by rectangle or width/height. Useful for denormalising a value.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * // Normalised rectangle of width 50%, height 50%
 * const r = {width: 0.5, height: 0.5};
 *
 * // Map to window:
 * const rr = Rects.multiply(r, window.innerWidth, window.innerHeight);
 * ```
 *
 * ```js
 * // Returns {width: someRect.width * someOtherRect.width ...}
 * Rects.multiply(someRect, someOtherRect);
 *
 * // Returns {width: someRect.width * 100, height: someRect.height * 200}
 * Rects.multiply(someRect, 100, 200);
 * ```
 *
 * Multiplication applies to the first parameter's x/y fields, if present.
 */
export function multiply(a: Rect, b: Rect | number, c?: number): Rect;
export function multiply(a: RectPositioned, b: Rect): RectPositioned;

/**
 * Multiplies `a` by rectangle or width/height. Useful for denormalising a value.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * // Normalised rectangle of width 50%, height 50%
 * const r = {width: 0.5, height: 0.5};
 *
 * // Map to window:
 * const rr = Rects.multiply(r, window.innerWidth, window.innerHeight);
 * ```
 *
 * ```js
 * // Returns {width: someRect.width * someOtherRect.width ...}
 * Rects.multiply(someRect, someOtherRect);
 *
 * // Returns {width: someRect.width * 100, height: someRect.height * 200}
 * Rects.multiply(someRect, 100, 200);
 * ```
 *
 * Multiplication applies to the first parameter's x/y fields, if present.
 */
//eslint-disable-next-line func-style
export function multiply(
  a: RectPositioned | Rect,
  b: Rect | number,
  c?: number
): RectPositioned | Rect {
  guard(a, `a`);
  if (isRect(b)) {
    return isRectPositioned(a) ? Object.freeze({
      ...a,
      x: a.x * b.width,
      y: a.y * b.height,
      width: a.width * b.width,
      height: a.height * b.height,
    }) : Object.freeze({
      ...a,
      width: a.width * b.width,
      height: a.height * b.height,
    });
  } else {
    if (typeof b !== `number`) {
      throw new TypeError(
        `Expected second parameter of type Rect or number. Got ${ JSON.stringify(
          b
        ) }`
      );
    }
    if (c === undefined) c = b;

    return isRectPositioned(a) ? Object.freeze({
      ...a,
      x: a.x * b,
      y: a.y * c,
      width: a.width * b,
      height: a.height * c,
    }) : Object.freeze({
      ...a,
      width: a.width * b,
      height: a.height * c,
    });
  }
}

/**
 * Multiplies all components of `rect` by `amount`
 * @param rect
 * @param amount
 */
export function multiplyScalar(rect: Rect, amount: number): Rect;
/**
 * Multiplies all components of `rect` by `amount`
 * @param rect
 * @param amount
 */
export function multiplyScalar(
  rect: RectPositioned,
  amount: number
): RectPositioned;
/**
 * Multiplies all components of `rect` by `amount`
 * @param rect
 * @param amount
 */
export function multiplyScalar(
  rect: Rect | RectPositioned,
  amount: number
): Rect | RectPositioned {
  return isPositioned(rect) ? Object.freeze({
    ...rect,
    x: rect.x * amount,
    y: rect.y * amount,
    width: rect.width * amount,
    height: rect.height * amount,
  }) : Object.freeze({
    ...rect,
    width: rect.width * amount,
    height: rect.height * amount,
  });
}
