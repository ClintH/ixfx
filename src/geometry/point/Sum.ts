import { Empty } from "./Empty.js";
import { guard, isPoint } from "./Guard.js";
import type { Point } from "./PointType.js";

type Sum = {
  /**
   * Adds two sets of coordinates. If y is omitted, the parameter for x is added to both x and y
   */
  (aX: number, aY: number, bX: number, bY: number): Point;
  /**
   * Add x,y to a
   */
  (a: Point, x: number, y?: number): Point;
  /**
   * Add two points
   */
  (a: Point, b?: Point): Point;
};

/**
 * Returns a Point of `a` plus `b`. ie:
 *
 * ```js
 * return {
 *   x: a.x + b.x,
 *   y: a.y + b.y
 * };
 * ```
 *
 * Usage:
 *
 * ```js
 * sum(ptA, ptB);
 * sum(x1, y1, x2, y2);
 * sum(ptA, x2, y2);
 * sum(ptA, xAndY);
 * ```
 */
export const sum: Sum = function (
  a: Point | number,
  b: Point | number | undefined,
  c?: number,
  d?: number
): Point {
  // ✔️ Unit tested
  if (a === undefined) throw new TypeError(`a missing`);

  let ptA: Point | undefined;
  let ptB: Point | undefined;
  if (isPoint(a)) {
    ptA = a;
    if (b === undefined) b = Empty;
    if (isPoint(b)) {
      ptB = b;
    } else {
      if (b === undefined) throw new Error(`Expects x coordinate`);
      ptB = { x: b, y: c ?? b };
    }
  } else if (!isPoint(b)) {
    // Neither of first two params are points
    if (b === undefined) throw new Error(`Expected number as second param`);
    ptA = { x: a, y: b };
    if (c === undefined) throw new Error(`Expects x coordiante`);
    ptB = { x: c, y: d ?? 0 };
  }

  if (ptA === undefined) throw new Error(`ptA missing. a: ${ JSON.stringify(a) }`);
  if (ptB === undefined) throw new Error(`ptB missing. b: ${ JSON.stringify(b) }`);
  guard(ptA, `a`);
  guard(ptB, `b`);
  return Object.freeze({
    x: ptA.x + ptB.x,
    y: ptA.y + ptB.y,
  });
};
