import { throwNumberTest } from "../../Guards.js";
import { getPointParameter } from "./GetPointParameter.js";
import { guard, guardNonZeroPoint, isPoint } from "./Guard.js";
import type { Point, Point3d } from "./PointType.js";
import { guard as RectsGuard, isRect } from '../rect/Guard.js'
import type { Rect } from "../rect/RectTypes.js";
/**
 * Divides point a by rectangle:
 * ```js
 * return {
 *  x: a.x / rect.width,
 *  y: a.y / rect.hight
 * };
 * ```
 * 
 * Or point:
 * ```js
 * return {
 *  x: a.x / b.x,
 *  y: a.y / b.y
 * }
 * ```
 * 
 * 
 * Dividing by zero will give Infinity for that dimension.
 * @param a
 * @param rectOrPoint
 */
export function divide(a: Point, rectOrPoint: Rect | Point): Point;

/**
 * Divides a point by x,y.
 * ```js
 * return {
 *  x: a.x / x,
 *  y: b.y / y
 * };
 * ```
 * 
 * Dividing by zero will give Infinity for that dimension.
 * @param a Point
 * @param x X divisor
 * @param y Y divisor. If unspecified, x divisor is used.
 */
export function divide(a: Point, x: number, y?: number): Point;

/**
 * Divides two sets of points:
 * ```js
 * return {
 *  x: x1 / x2,
 *  y: y1 / y2
 * };
 * ```
 * 
 * Dividing by zero will give Infinity for that dimension.
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 */
export function divide(x1: number, y1: number, x2?: number, y2?: number): Point;

/**
 * Divides a from b. If a contains a zero, that axis will be returned as zero
 * @param a
 * @param b
 * @param c
 * @param d
 * @returns
 */
export function divide(
  a: Point | number,
  b: Rect | Point | number,
  c?: number,
  d?: number
): Point {
  // ✔️ Unit tested

  if (isPoint(a)) {
    guard(a, `a`);
    if (isPoint(b)) {
      //guardNonZeroPoint(b);
      return Object.freeze({
        x: a.x / b.x,
        y: a.y / b.y,
      });
    } else if (isRect(b)) {
      RectsGuard(b, `rect`);
      return Object.freeze({
        x: a.x / b.width,
        y: a.y / b.height,
      });
    } else {
      if (c === undefined) c = b;
      guard(a);
      throwNumberTest(b, `nonZero`, `x`);
      throwNumberTest(c, `nonZero`, `y`);
      return Object.freeze({
        x: a.x / b,
        y: a.y / c,
      });
    }
  } else {
    if (typeof b !== `number`) {
      throw new TypeError(`expected second parameter to be y1 coord`);
    }
    throwNumberTest(a, `positive`, `x1`);
    throwNumberTest(b, `positive`, `y1`);
    if (c === undefined) c = 1;
    if (d === undefined) d = c;
    throwNumberTest(c, `nonZero`, `x2`);
    throwNumberTest(d, `nonZero`, `y2`);

    return Object.freeze({
      x: a / c,
      y: b / d,
    });
  }
}

/**
 * Returns a function that divides a point:
 * ```js
 * const f = divider(100, 200);
 * f(50,100); // Yields: { x: 0.5, y: 0.5 }
 * ```
 *
 * Input values can be Point, separate x,y and optional z values or an array:
 * ```js
 * const f = divider({ x: 100, y: 100 });
 * const f = divider( 100, 100 );
 * const f = divider([ 100, 100 ]);
 * ```
 *
 * Likewise the returned function an take these as inputs:
 * ```js
 * f({ x: 100, y: 100});
 * f( 100, 100 );
 * f([ 100, 100 ]);
 * ```
 *
 * Function throws if divisor has 0 for any coordinate (since we can't divide by 0)
 * @param a Divisor point, array of points or x
 * @param b Divisor y value
 * @param c Divisor z value
 * @returns
 */
//eslint-disable-next-line functional/prefer-readonly-type
export function divider(a: Point | number | Array<number>, b?: number, c?: number) {
  const divisor = getPointParameter(a, b, c);
  guardNonZeroPoint(divisor, `divisor`);

  return (
    aa: Point | number | Array<number>,
    bb?: number,
    cc?: number
  ): Point | Point3d => {
    const dividend = getPointParameter(aa, bb, cc);

    return typeof dividend.z === `undefined` ? Object.freeze({
      x: dividend.x / divisor.x,
      y: dividend.y / divisor.y,
    }) : Object.freeze({
      x: dividend.x / divisor.x,
      y: dividend.y / divisor.y,
      z: dividend.z / (divisor.z ?? 1),
    });
  };
}
