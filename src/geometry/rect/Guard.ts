import type { RectPositioned, Rect } from "./RectTypes.js";
import { guard as PointsGuard } from '../point/Guard.js';
import type { Point } from '../point/PointType.js';

export const guardDim = (d: number, name = `Dimension`) => {
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
export const guard = (rect: Rect, name = `rect`) => {
  if (rect === undefined) throw new Error(`{$name} undefined`);
  if (isPositioned(rect)) PointsGuard(rect, name);
  guardDim(rect.width, name + `.width`);
  guardDim(rect.height, name + `.height`);
};

/**
 * Returns a positioned rect or if it's not possible, throws an error.
 * 
 * If `rect` is positioned and `origin` is provided, returned result uses `origin` as x,y instead.
 * ```js
 * // Returns input because it's positioned
 * getRectPositioned({x:1,y:2,width:10,height:20});
 * // Returns {x:1,y:2,width:10,height:20}
 * getRectPositioned({width:10,height:20}, {x:1, y:2 }); 
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

export const guardPositioned = (rect: RectPositioned, name = `rect`) => {
  if (!isPositioned(rect)) throw new Error(`Expected ${ name } to have x,y`);
  guard(rect, name);
};

export const isEmpty = (rect: Rect): boolean =>
  rect.width === 0 && rect.height === 0;
export const isPlaceholder = (rect: Rect): boolean =>
  Number.isNaN(rect.width) && Number.isNaN(rect.height);

/**
 * Returns _true_ if `p` has a position (x,y)
 * @param p Point, Rect or RectPositiond
 * @returns
 */
export const isPositioned = (
  p: Point | Rect | RectPositioned
): p is Point =>
  (p as Point).x !== undefined && (p as Point).y !== undefined;

/**
 * Returns _true_ if `p` has width and height.
 * @param p
 * @returns
 */
export const isRect = (p: unknown): p is Rect => {
  if (p === undefined) return false;
  if ((p as Rect).width === undefined) return false;
  if ((p as Rect).height === undefined) return false;
  return true;
};

/**
 * Returns _true_ if `p` is a positioned rectangle
 * Having width, height, x and y properties.
 * @param p
 * @returns
 */
export const isRectPositioned = (
  p: any
): p is RectPositioned => isRect(p) && isPositioned(p);
