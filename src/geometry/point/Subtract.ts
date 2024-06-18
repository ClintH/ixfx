import { throwNumberTest } from "../../util/GuardNumbers.js";
import { guard, isPoint } from "./Guard.js";
import type { Point } from "./PointType.js";

/**
 * Returns `a` minus `b`
 *
 * ie.
 * ```js
 * return {
 *   x: a.x - b.x,
 *   y: a.y - b.y
 * };
 * ```
 * @param a Point a
 * @param b Point b
 * @returns Point
 */
export function subtract(a: Point, b: Point): Point;

/**
 * Returns `a` minus the given coordinates.
 *
 * ie:
 * ```js
 * return {
 *  x: a.x - x,
 *  y: a.y - y
 * }
 * ```
 * @param a Point
 * @param x X coordinate
 * @param y Y coordinate (if omitted, x is used as well)
 */
export function subtract(a: Point, x: number, y?: number): Point;

/**
 * Subtracts two sets of x,y pairs.
 *
 * If first parameter is a Point, any additional properties of it
 * are included in returned Point.
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 */
export function subtract(x1: number, y1: number, x2: number, y2: number): Point;

//eslint-disable-next-line func-style
export function subtract(
  a: Point | number,
  b: Point | number,
  c?: number,
  d?: number
): Point {
  if (isPoint(a)) {
    guard(a, `a`);
    if (isPoint(b)) {
      guard(b, `b`);
      return Object.freeze({
        ...a,
        x: a.x - b.x,
        y: a.y - b.y,
      });
    } else {
      if (c === undefined) c = b;
      return Object.freeze({
        ...a,
        x: a.x - b,
        y: a.y - c,
      });
    }
  } else {
    throwNumberTest(a, ``, `a`);
    if (typeof b !== `number`) {
      throw new TypeError(`Second parameter is expected to by y value`);
    }
    throwNumberTest(b, ``, `b`);

    if (Number.isNaN(c)) throw new Error(`Third parameter is NaN`);
    if (Number.isNaN(d)) throw new Error(`Fourth parameter is NaN`);

    if (c === undefined) c = 0;
    if (d === undefined) d = 0;
    return Object.freeze({
      x: a - c,
      y: b - d,
    });
  }
}
