import type { RectPositioned, Rect } from "./rect-types.js";
import { guard as PointsGuard } from '../point/guard.js';
import type { Point } from '../point/point-type.js';

/**
 * Throws an error if the dimensions of the rectangle are undefined, NaN or negative.
 * @param d 
 * @param name 
 */
export const guardDim = (d: number, name = `Dimension`): void => {
  if (d === undefined) throw new Error(`${ name } is undefined`);
  if (Number.isNaN(d)) throw new Error(`${ name } is NaN`);
  if (d < 0) throw new Error(`${ name } cannot be negative`);
};

/**
 * Throws an error if rectangle is missing fields or they
 * are not valid.
 * 
 * Checks:
 * * `width` and `height` must be defined on `rect`
 * * dimensions (w & h) must not be NaN
 * * dimensions (w & h) must not be negative
 * 
 * If `rect` has x,y, this value is checked as well.
 * @param rect
 * @param name
 */
export const guard = (rect: Rect, name = `rect`): void => {
  if (rect === undefined) throw new Error(`{$name} undefined`);
  if (isPositioned(rect)) PointsGuard(rect, name);
  guardDim(rect.width, name + `.width`);
  guardDim(rect.height, name + `.height`);
};

/**
 * Returns a positioned rect or if it's not possible, throws an error.
 * 
 * If `rect` does not have a position, `origin` is used.
 * If `rect` is positioned and `origin` is provided, returned result uses `origin` as x,y instead.
 * ```js
 * // Returns input because it's positioned
 * getRectPositioned({ x:1, y:2, width:10, height:20 });
 * 
 * // Returns { x:1, y:2, width:10, height:20 }
 * getRectPositioned({ width:10, height:20 }, { x:1, y:2 });
 *  
 * // Throws, because we have no point
 * getRectPositioned({width:10,height:20})
 * ```
 * @param rect 
 * @param origin 
 * @returns 
 */
export const getRectPositioned = (rect: Rect | RectPositioned, origin?: Point): RectPositioned => {
  guard(rect);
  if (isPositioned(rect) && origin === undefined) {
    return rect;
  }
  if (origin === undefined) throw new Error(`Unpositioned rect needs origin parameter`);
  return Object.freeze({ ...rect, ...origin });

}

/**
 * Throws an error if `rect` is does not have a position, or
 * is an invalid rectangle
 * @param rect 
 * @param name 
 */
export const guardPositioned = (rect: RectPositioned, name = `rect`): void => {
  if (!isPositioned(rect)) throw new Error(`Expected ${ name } to have x,y`);
  guard(rect, name);
};

/**
 * Returns _true_ if `rect` has width and height values of 0.
 * Use Rects.Empty or Rects.EmptyPositioned to generate an empty rectangle.
 * @param rect 
 * @returns 
 */
export const isEmpty = (rect: Rect): boolean =>
  rect.width === 0 && rect.height === 0;

/**
 * Returns _true_ if `rect` is a placeholder, with both width and height values of NaN.
 * Use Rects.Placeholder or Rects.PlaceholderPositioned to generate a placeholder.
 * @param rect 
 * @returns 
 */
export const isPlaceholder = (rect: Rect): boolean =>
  Number.isNaN(rect.width) && Number.isNaN(rect.height);

/**
 * Returns _true_ if `rect` has position (x,y) fields.
 * @param rect Point, Rect or RectPositiond
 * @returns
 */
export const isPositioned = (
  rect: Point | Rect | RectPositioned
): rect is Point =>
  (rect as Point).x !== undefined && (rect as Point).y !== undefined;

/**
 * Returns _true_ if `rect` has width and height fields.
 * @param rect
 * @returns
 */
export const isRect = (rect: unknown): rect is Rect => {
  if (rect === undefined) return false;
  if ((rect as Rect).width === undefined) return false;
  if ((rect as Rect).height === undefined) return false;
  return true;
};

/**
 * Returns _true_ if `rect` is a positioned rectangle
 * Having width, height, x and y properties.
 * @param rect
 * @returns
 */
export const isRectPositioned = (
  rect: any
): rect is RectPositioned => isRect(rect) && isPositioned(rect);
