import { getPointParameter, getTwoPointParameters } from "./GetPointParameter.js";
import { guard, guardNonZeroPoint, isPoint3d } from "./Guard.js";
import type { Point, Point3d } from "./PointType.js";
import type { Writeable } from "../../TsUtil.js";

export function divide(a: Point, b: Point): Point;
export function divide(a: Point3d, b: Point3d): Point3d;
export function divide(a: Point, x: number, y: number): Point;
export function divide(a: Point3d, x: number, y: number, z: number): Point3d;
export function divide(ax: number, ay: number, bx: number, by: number): Point;
export function divide(ax: number, ay: number, az: number, bx: number, by: number, bz: number): Point3d;

/**
 * Returns a Point with the x,y,z values of two points divide (a/b).
 * 
 * `z` parameter is used, if present. Uses a default value of 0 for 'z' when dividing a 2D point with a 3D one.
 *
 * Examples:
 *
 * ```js
 * divide(ptA, ptB);
 * divide(x1, y1, x2, y2);
 * divide(ptA, x2, y2);
 * ```
 */
export function divide(
  a1: Point | Point3d | number, ab2: Point | Point3d | number, ab3?: number, ab4?: number, ab5?: number, ab6?: number
): Point | Point3d {
  const [ ptA, ptB ] = getTwoPointParameters(a1 as any, ab2 as any, ab3 as any, ab4 as any, ab5 as any, ab6 as any);
  guard(ptA, `a`);
  guard(ptB, `b`);
  if (ptB.x === 0) throw new TypeError('Cannot divide by zero (b.x is 0)');
  if (ptB.y === 0) throw new TypeError('Cannot divide by zero (b.y is 0)');

  let pt: Writeable<Point> = {
    x: ptA.x / ptB.x,
    y: ptA.y / ptB.y,
  };
  if (isPoint3d(ptA) || isPoint3d(ptB)) {
    if (ptB.z === 0) throw new TypeError('Cannot divide by zero (b.z is 0)');

    pt.z = (ptA.z ?? 0) / (ptB.z ?? 0);
  };
  return Object.freeze(pt);
};


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
export function divider(a: Point3d | Point | number | Array<number>, b?: number, c?: number) {
  const divisor = getPointParameter(a, b, c);
  guardNonZeroPoint(divisor, `divisor`);

  return (
    aa: Point3d | Point | number | Array<number>,
    bb?: number,
    cc?: number
  ): Point => {
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
