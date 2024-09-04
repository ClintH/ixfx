import { isPoint, isPoint3d } from "./Guard.js";
import type { Point, Point3d } from "./PointType.js";

export function abs(pt: Point3d): Point3d;
export function abs(pt: Point): Point;

/**
 * Returns a point with Math.abs applied to x,y and z if present.
 * ```js
 * Points.abs({ x:1,  y:1  }); // { x: 1, y: 1 }
 * Points.abs({ x:-1, y:1  }); // { x: 1, y: 1 }
 * Points.abs({ x:-1, y:-1 }); // { x: 1, y: 1 }
 * ```
 * @param pt
 * @returns
 */
export function abs(pt: Point): Point {
  if (isPoint3d(pt)) {
    return Object.freeze({
      ...pt,
      x: Math.abs(pt.x),
      y: Math.abs(pt.y),
      z: Math.abs(pt.z)
    });
  } else if (isPoint(pt)) {
    return Object.freeze({
      ...pt,
      x: Math.abs(pt.x),
      y: Math.abs(pt.y)
    });
  } else throw new TypeError(`Param 'pt' is not a point`);
};