import type { Point } from "bezier-js";
import { guard } from "./Guard.js";
import { isPositioned, isRectPositioned } from "./Guard.js";
import { isCirclePositioned } from '../circle/Guard.js';
import type { RectPositioned, Rect, CirclePositioned } from "../Types.js";
import * as Intersects from '../Intersects.js';
import { isPoint } from "../points/Guard.js";
/**
 * Returns _true_ if `point` is within, or on boundary of `rect`.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * Rects.intersectsPoint(rect, { x: 100, y: 100});
 * ```
 * @param rect
 * @param point
 */
export function intersectsPoint(
  rect: Rect | RectPositioned,
  point: Point
): boolean;

/**
 * Returns true if x,y coordinate is within, or on boundary of `rect`.
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * Rects.intersectsPoint(rect, 100, 100);
 * ```
 * @param rect
 * @param x
 * @param y
 */
export function intersectsPoint(
  rect: Rect | RectPositioned,
  x: number,
  y: number
): boolean;

/**
 * Returns true if point is within or on boundary of `rect`.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * Rects.intersectsPoint(rect, { x: 100, y: 100});
 * Rects.intersectsPoint(rect, 100, 100);
 * ```
 * @param rect
 * @param a
 * @param b
 * @returns
 */
//eslint-disable-next-line func-style
export function intersectsPoint(
  rect: Rect | RectPositioned,
  a: Point | number,
  b?: number
): boolean {
  guard(rect, `rect`);
  //eslint-disable-next-line functional/no-let
  let x = 0;
  //eslint-disable-next-line functional/no-let
  let y = 0;
  if (typeof a === `number`) {
    if (b === undefined) throw new Error(`x and y coordinate needed`);
    x = a;
    y = b;
  } else {
    x = a.x;
    y = a.y;
  }
  if (isPositioned(rect)) {
    if (x - rect.x > rect.width || x < rect.x) return false;
    if (y - rect.y > rect.height || y < rect.y) return false;
  } else {
    // Assume 0,0
    if (x > rect.width || x < 0) return false;
    if (y > rect.height || y < 0) return false;
  }
  return true;
}

/**
 * Returns true if `a` or `b` overlap, are equal, or `a` contains `b`.
 * A rectangle can be checked for intersections with another RectPositioned, CirclePositioned or Point.
 *
 */
export const isIntersecting = (
  a: RectPositioned,
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  b: CirclePositioned | Point
): boolean => {
  if (!isRectPositioned(a)) {
    throw new Error(`a parameter should be RectPositioned`);
  }

  if (isCirclePositioned(b)) {
    return Intersects.circleRect(b, a);
  } else if (isPoint(b)) {
    return intersectsPoint(a, b);
  }
  throw new Error(`Unknown shape for b: ${ JSON.stringify(b) }`);
};