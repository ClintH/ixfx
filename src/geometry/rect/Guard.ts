import type { RectPositioned, Rect, PointCalculableShape, Point } from "../Types.js";
import { guard as PointsGuard } from '../point/Guard.js';

export const guardDim = (d: number, name = `Dimension`) => {
  if (d === undefined) throw new Error(`${ name } is undefined`);
  if (Number.isNaN(d)) throw new Error(`${ name } is NaN`);
  if (d < 0) throw new Error(`${ name } cannot be negative`);
};

/**
 * Throws an error if rectangle is missing fields or they
 * are not valid.
 * @param rect
 * @param name
 */
export const guard = (rect: Rect, name = `rect`) => {
  if (rect === undefined) throw new Error(`{$name} undefined`);
  if (isPositioned(rect)) PointsGuard(rect, name);
  guardDim(rect.width, name + `.width`);
  guardDim(rect.height, name + `.height`);
};

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
  p: Rect | RectPositioned | PointCalculableShape
): p is RectPositioned => isRect(p) && isPositioned(p);
