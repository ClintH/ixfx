import { type Line } from "../line/line-type.js";
import { type Point } from '../point/point-type.js';
import { distance } from '../point/distance.js';
import { angleRadian } from '../point/angle.js';
import { toString as pointToString } from '../point/To.js';
import { type PolarRay } from "./types.js";
import { toCartesian as polarToCartesian } from "./conversions.js";

/**
 * Converts a ray to a Line in cartesian coordinates.
 * 
 * By default, the ray's origin is taken to be 0,0.
 * Passing in an origin will override this default, or whatever
 * the ray's origin property is.
 * @param ray Ray
 * @param origin Override or provide origin point
 * @returns 
 */
export const toCartesian = (ray: PolarRay, origin?: Point): Line => {
  const o = getOrigin(ray, origin);
  const a = polarToCartesian(ray.offset, ray.angleRadian, o);
  const b = polarToCartesian(ray.offset + ray.length, ray.angleRadian, o);
  return { a, b }
}

const getOrigin = (ray: PolarRay, origin?: Point): Point => {
  if (origin !== undefined) return origin;
  if (ray.origin !== undefined) return ray.origin;
  return { x: 0, y: 0 };
}

/**
 * Returns a copy of `ray` ensuring it has an origin.
 * If the `origin` parameter is provided, it will override the existing origin.
 * If no origin information is available, 0,0 is used.
 * @param ray 
 * @param origin 
 * @returns 
 */
// const withOrigin = (ray: PolarRay, origin?: Point): PolarRayWithOrigin => {
//   if (origin) {
//     return {
//       ...ray,
//       origin
//     };
//   }
//   if (ray.origin !== undefined) return { ...ray } as PolarRayWithOrigin;
//   return {
//     ...ray,
//     origin: { x: 0, y: 0 }
//   }
// }



// function getAngle(a: Point, b: Point) {
//   const angle = Math.atan2(b.y - a.y, b.x - a.x);// * (180 / Math.PI) + 90;
//   return angle;//return (angle < 0) ? scale(angle, -90, 0, 0, piPi) : angle;
// }

/**
 * Returns a string representation of the ray, useful for debugging.
 * 
 * ```
 * "PolarRay(angle: ... offset: ... len: ... origin: ...)"
 * ```
 * @param ray 
 * @returns 
 */
export const toString = (ray: PolarRay): string => {
  let basic = `PolarRay(angle: ${ ray.angleRadian } offset: ${ ray.offset } len: ${ ray.length }`;
  if (ray.origin) {
    basic += ` origin: ${ pointToString(ray.origin) }`;
  }
  basic += `)`;
  return basic;
}

/**
 * Returns a PolarRay based on a line and origin.
 * 
 * If `origin` is omitted, the origin is taken to be the 'a' point of the line.
 * Otherwise, the origin value is used to determine the 'offset' of the ray.
 * @param line 
 * @param origin 
 * @returns 
 */
export const fromLine = (line: Line, origin?: Point): PolarRay => {
  const o = origin ?? line.a;
  return {
    angleRadian: angleRadian(line.b, o),
    offset: distance(line.a, o),
    length: distance(line.b, line.a),
    origin: o
  }
}

