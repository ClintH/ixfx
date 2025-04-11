import { guard } from "./guard.js";
import type { RectPositioned, Rect } from "./rect-types.js";
import { isRect, isRectPositioned, isPositioned } from "./guard.js";

/**
 * An operation between two fields of a rectangle.
 * Used in the context of {@link applyMerge}
 * ```
 * // Multiply fields
 * const op = (a, b) => a*b;
 * ```
 */
export type ApplyMergeOp = (a: number, b: number) => number

export type ApplyFieldOp = (fieldValue: number, fieldName?: `x` | `y` | `width` | `height`) => number

export function applyFields(op: ApplyFieldOp, rect: RectPositioned): RectPositioned;
export function applyFields(op: ApplyFieldOp, rect: Rect): Rect;
export function applyFields(op: ApplyFieldOp, width: number, height: number): Rect;

/**
 * Applies an operation over each field of a rectangle.
 * ```js
 * // Convert x,y,width,height to integer values
 * applyFields(v => Number.floor(v), someRect);
 * ```
 * @param op
 * @param rectOrWidth 
 * @param heightValue 
 * @returns 
 */
export function applyFields(op: ApplyFieldOp, rectOrWidth: RectPositioned | Rect | number, heightValue?: number): RectPositioned | Rect {
  let width = (typeof rectOrWidth === `number`) ? rectOrWidth : rectOrWidth.width;
  let height = (typeof rectOrWidth === `number`) ? heightValue : rectOrWidth.height;
  if (width === undefined) throw new Error(`Param 'width' undefined`);
  if (height === undefined) throw new Error(`Param 'height' undefined`);

  width = op(width, `width`);
  height = op(height, `height`);

  if (typeof rectOrWidth === `object`) {
    if (isPositioned(rectOrWidth)) {
      const x = op(rectOrWidth.x, `x`);
      const y = op(rectOrWidth.y, `y`);
      return { ...rectOrWidth, width, height, x, y };
    } else {
      return {
        ...rectOrWidth, width, height
      }
    }
  }
  return { width, height };
}

export function applyMerge(
  op: ApplyMergeOp,
  rect: RectPositioned,
  width: number,
  height?: number
): RectPositioned;
export function applyMerge(op: ApplyMergeOp, rect: Rect, width: number, height: number): Rect;
export function applyMerge(op: ApplyMergeOp, a: RectPositioned, b: Rect): RectPositioned;
export function applyMerge(op: ApplyMergeOp, a: Rect, b: Rect): Rect;

/**
 * Applies an joint operation field-wise on two rectangles, returning a single rectangle. This is used to support operations like summing two rectangles.
 * ```js
 * // Eg make a new rectangle by summing each field of rectangle A & B.
 * apply((valueA,valueB) => valueA+valueB, rectA, rectB);
 * ```
 * @param op 
 * @param a 
 * @param b 
 * @param c 
 * @returns 
 */
export function applyMerge(
  op: ApplyMergeOp,
  a: RectPositioned | Rect,
  b: Rect | number,
  c?: number
): RectPositioned | Rect {
  guard(a, `a`);

  if (isRect(b)) {
    // Math op by another rectangle
    return isRectPositioned(a) ? Object.freeze({
      ...a,
      x: op(a.x, b.width),
      y: op(a.y, b.height),
      width: op(a.width, b.width),
      height: op(a.height, b.height),
    }) : Object.freeze({
      ...a,
      width: op(a.width, b.width),
      height: op(a.height, b.height),
    });
  } else {
    // Math op with a series of values
    if (typeof b !== `number`) {
      throw new TypeError(
        `Expected second parameter of type Rect or number. Got ${ JSON.stringify(
          b
        ) }`
      );
    }
    if (typeof c !== `number`) throw new Error(`Expected third param as height. Got ${ JSON.stringify(c) }`);
    return isRectPositioned(a) ? Object.freeze({
      ...a,
      x: op(a.x, b),
      y: op(a.y, c),
      width: op(a.width, b),
      height: op(a.height, c),
    }) : Object.freeze({
      ...a,
      width: op(a.width, b),
      height: op(a.height, c),
    });
  }
}

/**
 * Uses `op` with `param` to width and height.
 * @param op 
 * @param rect 
 * @param parameter 
 */
export function applyScalar(op: ApplyMergeOp, rect: Rect, parameter: number): Rect;

/**
 * Uses `op` to apply with `param` to width, height, x & y.
 * Use `applyDim` to apply just to dimensions.
 * @param op 
 * @param rect 
 * @param parameter 
 */
export function applyScalar(
  op: ApplyMergeOp,
  rect: RectPositioned,
  parameter: number
): RectPositioned;

export function applyScalar(
  op: ApplyMergeOp,
  rect: Rect | RectPositioned,
  parameter: number
): Rect | RectPositioned {
  return isPositioned(rect) ? Object.freeze({
    ...rect,
    x: op(rect.x, parameter),
    y: op(rect.y, parameter),
    width: op(rect.width, parameter),
    height: op(rect.height, parameter),
  }) : Object.freeze({
    ...rect,
    width: op(rect.width, parameter),
    height: op(rect.height, parameter),
  });
}

/**
 * Applies `op` with `param` to `rect`'s width and height.
 * @param op 
 * @param rect 
 * @param parameter 
 * @returns 
 */
export function applyDim(
  op: ApplyMergeOp,
  rect: Rect | RectPositioned,
  parameter: number
): Rect | RectPositioned {
  return Object.freeze({
    ...rect,
    width: op(rect.width, parameter),
    height: op(rect.height, parameter),
  });
}