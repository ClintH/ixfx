import { type Line } from "../line/line-type.js";
import { type Point } from '../point/point-type.js';
import { distance } from '../point/distance.js';
import { angleRadian } from '../point/angle.js';
import { type PolarRay } from "./types.js";
import { toCartesian as polarToCartesian } from "./conversions.js";

/**
 * Converts a ray to a Line in cartesian coordinates.
 * 
 * @param ray 
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

export const toString = (ray: PolarRay): string => {
  return `PolarRay(angle: ${ ray.angleRadian } offset: ${ ray.offset } len: ${ ray.length })`
}

/**
 * Returns a PolarRay based on a line and origin.
 * If `origin` is omitted, the origin is taken to be the 'a' point of the line.
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

