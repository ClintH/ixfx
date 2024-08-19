import { guard } from "./Guard.js";
import type { RectPositioned, Rect } from "./RectTypes.js";
import { isRect, isRectPositioned, isPositioned } from "./Guard.js";

export type ApplyOp = (a: number, b: number) => number

export function apply(
  op: ApplyOp,
  rect: RectPositioned,
  width: number,
  height?: number
): RectPositioned;
export function apply(op: ApplyOp, rect: Rect, width: number, height: number): Rect;
export function apply(op: ApplyOp, a: RectPositioned, b: Rect): RectPositioned;
export function apply(op: ApplyOp, a: Rect, b: Rect): Rect;
export function apply(
  op: ApplyOp,
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
 * @param param 
 */
export function applyScalar(op: ApplyOp, rect: Rect, param: number): Rect;

/**
 * Uses `op` to apply with `param` to width, height, x & y.
 * Use `applyDim` to apply just to dimensions.
 * @param op 
 * @param rect 
 * @param param 
 */
export function applyScalar(
  op: ApplyOp,
  rect: RectPositioned,
  param: number
): RectPositioned;

export function applyScalar(
  op: ApplyOp,
  rect: Rect | RectPositioned,
  param: number
): Rect | RectPositioned {
  return isPositioned(rect) ? Object.freeze({
    ...rect,
    x: op(rect.x, param),
    y: op(rect.y, param),
    width: op(rect.width, param),
    height: op(rect.height, param),
  }) : Object.freeze({
    ...rect,
    width: op(rect.width, param),
    height: op(rect.height, param),
  });
}

/**
 * Applies `op` with `param` to `rect`'s width and height.
 * @param op 
 * @param rect 
 * @param param 
 * @returns 
 */
export function applyDim(
  op: ApplyOp,
  rect: Rect | RectPositioned,
  param: number
): Rect | RectPositioned {
  return Object.freeze({
    ...rect,
    width: op(rect.width, param),
    height: op(rect.height, param),
  });
}