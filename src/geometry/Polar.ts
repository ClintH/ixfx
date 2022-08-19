import {degreeToRadian} from "./index.js";
import * as Points from "./Point.js";

/**
 * Polar coordinate, made up of a distance and angle in radians.
 * Most computations involving Coords require an `origin` as well.
 */
export type Coord = {
  readonly distance: number,
  readonly angleRadian: number
}

/**
 * Converts to Cartesian coordiantes
 */
type ToCartesian = {
  (point:Coord, origin?:Points.Point) :Points.Point
  (distance:number, angleRadians:number, origin?:Points.Point) :Points.Point
}

/**
 * Returns true if `p` seems to be a {@link Coord} (ie has both distance & angleRadian fields)
 * @param p 
 * @returns True if `p` seems to be a Coord
 */
export const isCoord = (p: number|unknown): p is Coord => {
  if ((p as Coord).distance === undefined) return false;
  if ((p as Coord).angleRadian === undefined) return false;
  return true;
};

/**
 * Converts a Cartesian coordinate to polar
 * 
 * ```js
 * import { Polar } from 'https://unpkg.com/ixfx/dist/geometry.js';
 * 
 * // Yields: { angleRadian, distance }
 * const polar = Polar.fromCartesian({x: 50, y: 50}, origin);
 * ```
 * 
 * Any additional properties of `point` are copied to object.
 * @param point Point
 * @param origin Origin
 * @returns 
 */
export const fromCartesian = (point: Points.Point, origin: Points.Point): Coord => {
  point = Points.subtract(point, origin);
  //eslint-disable-next-line functional/no-let
  //let a =  Math.atan2(point.y, point.x);
  //if (a < 0) a = Math.abs(a);
  //else a = Math.PI + (Math.PI - a);

  const angle = Math.atan2(point.y, point.x);
  //if (point.x < 0 && point.y > 0) angle += 180;
  //if (point.x > 0 && point.y < 0) angle += 360;
  //if (point.x < 0 && point.y < 0) angle += 180;
  
  return Object.freeze({
    ...point,
    angleRadian: angle,
    distance: Math.sqrt(point.x * point.x + point.y * point.y)
  });
};

/**
 * Converts to Cartesian coordinate from polar.
 * 
 * ```js
 * import { Polar } from 'https://unpkg.com/ixfx/dist/geometry.js';
 * 
 * const origin = { x: 50, y: 50}; // Polar origin
 * // Yields: { x, y }
 * const polar = Polar.toCartesian({ distance: 10, angleRadian: 0 }, origin);
 * ```
 * 
 * Distance and angle can be provided as numbers intead:
 * 
 * ```
 * // Yields: { x, y }
 * const polar = Polar.toCartesian(10, 0, origin);
 * ```
 * 
 * @param a
 * @param b 
 * @param c 
 * @returns 
 */
export const toCartesian:ToCartesian = (a:Coord|number, b?:Points.Point|number, c?:Points.Point): Points.Point => {
  if (isCoord(a)) {
    if (b === undefined) b = Points.Empty;
    if (!Points.isPoint(b)) throw new Error(`Expecting (Coord, Point). Point param wrong type.`);
    return polarToCartesian(a.distance, a.angleRadian, b);
  } else {
    if (typeof a === `number` && typeof b === `number`) {
      if (c === undefined) c = Points.Empty;
      if (!Points.isPoint(c)) throw new Error(`Expecting (number, number, Point). Point param wrong type`);
      return polarToCartesian(a, b, c);
    } else {
      throw new Error(`Expecting parameters of (number, number). Got: (${typeof(a)}, ${typeof(b)}, ${typeof(c)}). a: ${JSON.stringify(a)}`);
    }
  }
};

/**
 * Produces an Archimedean spiral. It's a generator.
 * 
 * ```js
 * const s = spiral(0.1, 1);
 * for (const coord of s) {
 *  // Use Polar coord...
 *  if (coord.step === 1000) break; // Stop after 1000 iterations
 * }
 * ```
 * 
 * @param smoothness 0.1 pretty rounded, at around 5 it starts breaking down
 * @param zoom At smoothness 0.1, zoom starting at 1 is OK
 */
//eslint-disable-next-line func-style
export function* spiral(smoothness:number, zoom:number): IterableIterator<Coord & {readonly step:number}> {
  //eslint-disable-next-line functional/no-let
  let step = 0;
  
  while (true) {
    //eslint-disable-next-line functional/no-let
    const a = smoothness * step++;
    yield {
      distance: zoom * a,
      angleRadian: a,
      step: step
    };
  }
}

/**
 * Returns a rotated coordiante
 * @param c Coordinate
 * @param amountRadian Amount to rotate, in radians 
 * @returns 
 */
export const rotate = (c:Coord, amountRadian:number): Coord => Object.freeze({
  ...c,
  angleRadian: c.angleRadian + amountRadian
});

/**
 * Returns a rotated coordinate
 * @param c Coordinate
 * @param amountDeg Amount to rotate, in degrees
 * @returns 
 */
export const rotateDegrees = (c:Coord, amountDeg:number):Coord => Object.freeze({
  ...c,
  angleRadian: c.angleRadian + degreeToRadian(amountDeg)
});

/**
 * Produces an Archimedian spiral with manual stepping.
 * @param step Step number. Typically 0, 1, 2 ...
 * @param smoothness 0.1 pretty rounded, at around 5 it starts breaking down
 * @param zoom At smoothness 0.1, zoom starting at 1 is OK
 * @returns 
 */
export const spiralRaw = (step:number, smoothness:number, zoom:number):Coord => {
  const a = smoothness * step;
  return Object.freeze({
    distance: zoom * a,
    angleRadian: a
  });
};

/**
 * Converts a polar coordiante to Cartesian
 * @param distance Distance
 * @param angleRadians Angle in radians
 * @param origin Origin
 * @returns 
 */
const polarToCartesian = (distance:number, angleRadians:number, origin:Points.Point):Points.Point => {
  Points.guard(origin);
  return Object.freeze({
    x: origin.x + (distance * Math.cos(angleRadians)),
    y: origin.y + (distance * Math.sin(angleRadians)),
  });
};


