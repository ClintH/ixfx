import { type Line, type PolyLine } from "../line/line-type.js";
import { type Point } from '../point/point-type.js';
import { distance } from '../point/distance.js';
import { angleRadian } from '../point/angle.js';
import { toString as pointToString } from '../point/to.js';
import { type PolarRay } from "./types.js";
import { toCartesian as polarToCartesian } from "./conversions.js";

export function toCartesian(rays: PolarRay[], origin?: Point): Line[];
export function toCartesian(ray: PolarRay, origin?: Point): Line;


/**
 * Converts a ray (or array of rays) to a Line in cartesian coordinates.
 * 
 * By default, the ray's origin is taken to be 0,0.
 * Passing in an origin will override this default, or whatever
 * the ray's origin property is.
 * @param ray Ray
 * @param origin Override or provide origin point
 * @returns 
 */
export function toCartesian(rayOrRays: PolarRay | PolarRay[], origin?: Point): Line | Line[] {

  const rays = Array.isArray(rayOrRays) ? rayOrRays : [ rayOrRays ];
  if (rays.length === 0) return []
  const lines = rays.map(ray => {
    const o = getOrigin(ray, origin);
    const a = polarToCartesian(ray.offset ?? 0, ray.angleRadian, o);
    const b = polarToCartesian((ray.offset ?? 0) + ray.length, ray.angleRadian, o);
    return { a, b }
  });
  if (Array.isArray(rayOrRays)) return lines;
  return lines[ 0 ];
}

// export const getLength = (a:PolarRay, b:PolarRay) => {
//   const o1 = (a.origin.x)
// }
export const isParallel = (a: PolarRay, b: PolarRay): boolean => (a.angleRadian === b.angleRadian)

const getOrigin = (ray: PolarRay, origin?: Point): Point => {
  if (origin !== undefined) return origin;
  if (ray.origin !== undefined) return ray.origin;
  return { x: 0, y: 0 };
}


/**
 * Returns a string representation of the ray, useful for debugging.
 * 
 * ```js
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

export function fromLine(line: Line[] | PolyLine, origin?: Point): PolarRay[];
export function fromLine(line: Line, origin?: Point): PolarRay;

/**
 * Returns a PolarRay based on a line(s) and origin.
 * 
 * If `origin` is omitted, the origin is taken to be the 'a' point of the line.
 * Otherwise, the origin value is used to determine the 'offset' of the ray.
 * 
 * @param lineOrLines Single line or array of lines 
 * @param origin 
 * @returns 
 */
export function fromLine(lineOrLines: PolyLine | Line[] | Line, origin?: Point): PolarRay[] | PolarRay {
  const lines = Array.isArray(lineOrLines) ? lineOrLines : [ lineOrLines as Line ];
  if (lines.length === 0) return [];

  const rays = lines.map(line => {
    if (origin) {
      return {
        angleRadian: angleRadian(line.a, origin),
        offset: distance(line.a, origin),
        length: distance(line.b, line.a),
        origin: origin
      }
    } else {
      return {
        angleRadian: angleRadian(line.a, line.b),
        length: distance(line.b, line.a),
        origin: line.a
      }
    }

  })

  if (Array.isArray(lineOrLines)) return rays;
  return rays[ 0 ];
}

