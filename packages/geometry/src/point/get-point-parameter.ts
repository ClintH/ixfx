import { isPoint, isPoint3d } from "./guard.js";
import type { Point, Point3d } from "./point-type.js";

export function getTwoPointParameters(a: Point, b: Point): [ a: Point, b: Point ];
export function getTwoPointParameters(a: Point3d, b: Point3d): [ a: Point3d, b: Point3d ];
export function getTwoPointParameters(a: Point, x: number, y: number): [ a: Point, b: Point ];
export function getTwoPointParameters(a: Point3d, x: number, y: number, z: number): [ a: Point3d, b: Point3d ];
export function getTwoPointParameters(ax: number, ay: number, bx: number, by: number): [ a: Point, b: Point ];
export function getTwoPointParameters(ax: number, ay: number, az: number, bx: number, by: number, bz: number): [ a: Point3d, b: Point3d ];
export function getTwoPointParameters(a1: Point | Point3d | number, ab2: Point | Point3d | number, ab3?: number, ab4?: number, ab5?: number, ab6?: number) {
  if (isPoint3d(a1) && isPoint3d(ab2)) return [ a1, ab2 ];
  if (isPoint(a1) && isPoint(ab2)) return [ a1, ab2 ];
  if (isPoint3d(a1)) {
    const b = {
      x: ab2,
      y: ab3,
      z: ab4
    }
    if (!isPoint3d(b)) throw new Error(`Expected x, y & z parameters`);
    return [ a1, b ];
  }
  if (isPoint(a1)) {
    const b = {
      x: ab2,
      y: ab3
    }
    if (!isPoint(b)) throw new Error(`Expected x & y parameters`);
    return [ a1, b ];
  }

  if (typeof ab5 !== `undefined` && typeof ab4 !== `undefined`) {
    const a = {
      x: a1,
      y: ab2,
      z: ab3
    };
    const b = {
      x: ab4,
      y: ab5,
      z: ab6
    }
    if (!isPoint3d(a)) throw new Error(`Expected x,y,z for first point`);
    if (!isPoint3d(b)) throw new Error(`Expected x,y,z for second point`);
    return [ a, b ];
  }

  const a = {
    x: a1,
    y: ab2
  };
  const b = {
    x: ab3,
    y: ab4
  }
  if (!isPoint(a)) throw new Error(`Expected x,y for first point`);
  if (!isPoint(b)) throw new Error(`Expected x,y for second point`);
  return [ a, b ];

}

/**
 * Returns a Point form of either a point, x,y params or x,y,z params.
 * If parameters are undefined, an empty point is returned (0, 0)
 * @ignore
 * @param a
 * @param b
 * @returns
 */
export function getPointParameter(
  a?: Point3d | Point | number | Array<number> | ReadonlyArray<number>,
  b?: number | boolean,
  c?: number
): Point | Point3d {
  if (a === undefined) return { x: 0, y: 0 };

  if (Array.isArray(a)) {
    if (a.length === 0) return Object.freeze({ x: 0, y: 0 });
    if (a.length === 1) return Object.freeze({ x: a[ 0 ], y: 0 });
    if (a.length === 2) return Object.freeze({ x: a[ 0 ], y: a[ 1 ] });
    if (a.length === 3) return Object.freeze({ x: a[ 0 ], y: a[ 1 ], z: a[ 2 ] });
    throw new Error(
      `Expected array to be 1-3 elements in length. Got ${ a.length }.`
    );
  }

  if (isPoint(a)) {
    return a;
  } else if (typeof a !== `number` || typeof b !== `number`) {
    throw new TypeError(
      `Expected point or x,y as parameters. Got: a: ${ JSON.stringify(
        a
      ) } b: ${ JSON.stringify(b) }`
    );
  }

  // x,y,z
  if (typeof c === `number`) {
    return Object.freeze({ x: a, y: b, z: c });
  }
  // x,y
  return Object.freeze({ x: a, y: b });
}