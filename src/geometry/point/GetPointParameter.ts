import { isPoint } from "./Guard.js";
import type { Point, Point3d } from "./PointType.js";

/**
 * Returns a Point form of either a point, x,y params or x,y,z params.
 * If parameters are undefined, an empty point is returned (0, 0)
 * @ignore
 * @param a
 * @param b
 * @returns
 */
export function getPointParameter(
  a?: Point | number | Array<number> | ReadonlyArray<number>,
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