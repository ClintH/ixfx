import { degreeToRadian, radianToDegree } from './Angles.js';
import * as Points from './points/index.js';
import { throwNumberTest } from '../Guards.js';
import type { Point, PolarCoord } from './Types.js';
const _piPi = Math.PI * 2;

//eslint-disable-next-line @typescript-eslint/naming-convention
const EmptyCartesian = Object.freeze({ x: 0, y: 0 });

/**
 * Converts to Cartesian coordiantes
 */
type ToCartesian = {
  (point: PolarCoord, origin?: Point): Point;
  (distance: number, angleRadians: number, origin?: Point): Point;
};

/**
 * Returns true if `p` seems to be a {@link PolarCoord} (ie has both distance & angleRadian fields)
 * @param p
 * @returns True if `p` seems to be a PolarCoord
 */
export const isPolarCoord = (p: unknown): p is PolarCoord => {
  if ((p as PolarCoord).distance === undefined) return false;
  if ((p as PolarCoord).angleRadian === undefined) return false;
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
export const fromCartesian = (
  point: Point,
  origin: Point
): PolarCoord => {
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
    distance: Math.hypot(point.x, point.y),
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
export const toCartesian: ToCartesian = (
  a: PolarCoord | number,
  b?: Point | number,
  c?: Point
): Point => {
  if (isPolarCoord(a)) {
    if (b === undefined) b = Points.Empty;
    if (Points.isPoint(b)) {
      return polarToCartesian(a.distance, a.angleRadian, b);
    }
    throw new Error(
      `Expecting (Coord, Point). Second parameter is not a point`
    );
  } else if (typeof a === `object`) {
    throw new TypeError(
      `First param is an object, but not a Coord: ${ JSON.stringify(a) }`
    );
  } else {
    if (typeof a === `number` && typeof b === `number`) {
      if (c === undefined) c = Points.Empty;
      if (!Points.isPoint(c)) {
        throw new Error(
          `Expecting (number, number, Point). Point param wrong type`
        );
      }
      return polarToCartesian(a, b, c);
    } else {
      throw new TypeError(
        `Expecting parameters of (number, number). Got: (${ typeof a }, ${ typeof b }, ${ typeof c }). a: ${ JSON.stringify(
          a
        ) }`
      );
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
export function* spiral(
  smoothness: number,
  zoom: number
): IterableIterator<PolarCoord & { readonly step: number }> {
  //eslint-disable-next-line functional/no-let
  let step = 0;

  while (true) {
    //eslint-disable-next-line functional/no-let
    const a = smoothness * step++;
    yield {
      distance: zoom * a,
      angleRadian: a,
      step: step,
    };
  }
}

/**
 * Returns a rotated coordinate
 * @param c Coordinate
 * @param amountRadian Amount to rotate, in radians
 * @returns
 */
export const rotate = (c: PolarCoord, amountRadian: number): PolarCoord =>
  Object.freeze({
    ...c,
    angleRadian: c.angleRadian + amountRadian,
  });

export const normalise = (c: PolarCoord): PolarCoord => {
  //guard(v, `v`);
  if (c.distance === 0) throw new Error(`Cannot normalise vector of length 0`);
  return Object.freeze({
    ...c,
    distance: 1,
  });
};

/**
 * Throws an error if PolarCoord is invalid
 * @param p
 * @param name
 */
export const guard = (p: PolarCoord, name = `Point`) => {
  if (p === undefined) {
    throw new Error(
      `'${ name }' is undefined. Expected {distance, angleRadian} got ${ JSON.stringify(
        p
      ) }`
    );
  }
  if (p === null) {
    throw new Error(
      `'${ name }' is null. Expected {distance, angleRadian} got ${ JSON.stringify(
        p
      ) }`
    );
  }
  if (p.angleRadian === undefined) {
    throw new Error(
      `'${ name }.angleRadian' is undefined. Expected {distance, angleRadian} got ${ JSON.stringify(
        p
      ) }`
    );
  }
  if (p.distance === undefined) {
    throw new Error(
      `'${ name }.distance' is undefined. Expected {distance, angleRadian} got ${ JSON.stringify(
        p
      ) }`
    );
  }
  if (typeof p.angleRadian !== `number`) {
    throw new TypeError(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `'${ name }.angleRadian' must be a number. Got ${ p.angleRadian }`
    );
  }
  if (typeof p.distance !== `number`) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new TypeError(`'${ name }.distance' must be a number. Got ${ p.distance }`);
  }

  if (p.angleRadian === null) throw new Error(`'${ name }.angleRadian' is null`);
  if (p.distance === null) throw new Error(`'${ name }.distance' is null`);

  if (Number.isNaN(p.angleRadian)) {
    throw new TypeError(`'${ name }.angleRadian' is NaN`);
  }
  if (Number.isNaN(p.distance)) throw new Error(`'${ name }.distance' is NaN`);
};
/**
 * Calculate dot product of two PolarCoords.
 *
 * Eg, power is the dot product of force and velocity
 *
 * Dot products are also useful for comparing similarity of
 *  angle between two unit PolarCoords.
 * @param a
 * @param b
 * @returns
 */
export const dotProduct = (a: PolarCoord, b: PolarCoord): number => {
  guard(a, `a`);
  guard(b, `b`);
  return a.distance * b.distance * Math.cos(b.angleRadian - a.angleRadian);
};

/**
 * Inverts the direction of coordinate. Ie if pointing north, will point south.
 * @param p
 * @returns
 */
export const invert = (p: PolarCoord): PolarCoord => {
  guard(p, `c`);
  return Object.freeze({
    ...p,
    angleRadian: p.angleRadian - Math.PI,
  });
};

/**
 * Returns true if PolarCoords have same magnitude but opposite direction
 * @param a
 * @param b
 * @returns
 */
export const isOpposite = (a: PolarCoord, b: PolarCoord): boolean => {
  guard(a, `a`);
  guard(b, `b`);
  if (a.distance !== b.distance) return false;
  return a.angleRadian === -b.angleRadian;
};

/**
 * Returns true if PolarCoords have the same direction, regardless of magnitude
 * @param a
 * @param b
 * @returns
 */
export const isParallel = (a: PolarCoord, b: PolarCoord): boolean => {
  guard(a, `a`);
  guard(b, `b`);
  return a.angleRadian === b.angleRadian;
};

/**
 * Returns true if coords are opposite direction, regardless of magnitude
 * @param a
 * @param b
 * @returns
 */
export const isAntiParallel = (a: PolarCoord, b: PolarCoord): boolean => {
  guard(a, `a`);
  guard(b, `b`);
  return a.angleRadian === -b.angleRadian;
};

/**
 * Returns a rotated coordinate
 * @param c Coordinate
 * @param amountDeg Amount to rotate, in degrees
 * @returns
 */
export const rotateDegrees = (c: PolarCoord, amountDeg: number): PolarCoord =>
  Object.freeze({
    ...c,
    angleRadian: c.angleRadian + degreeToRadian(amountDeg),
  });

/**
 * Produces an Archimedian spiral with manual stepping.
 * @param step Step number. Typically 0, 1, 2 ...
 * @param smoothness 0.1 pretty rounded, at around 5 it starts breaking down
 * @param zoom At smoothness 0.1, zoom starting at 1 is OK
 * @returns
 */
export const spiralRaw = (
  step: number,
  smoothness: number,
  zoom: number
): PolarCoord => {
  const a = smoothness * step;
  return Object.freeze({
    distance: zoom * a,
    angleRadian: a,
  });
};

/**
 * Multiplies the magnitude of a coord by `amt`.
 * Direction is unchanged.
 * @param v
 * @param amt
 * @returns
 */
export const multiply = (v: PolarCoord, amt: number): PolarCoord => {
  guard(v);
  throwNumberTest(amt, ``, `amt`);
  return Object.freeze({
    ...v,
    distance: v.distance * amt,
  });
};

/**
 * Divides the magnitude of a coord by `amt`.
 * Direction is unchanged.
 * @param v
 * @param amt
 * @returns
 */
export const divide = (v: PolarCoord, amt: number): PolarCoord => {
  guard(v);
  throwNumberTest(amt, ``, `amt`);
  return Object.freeze({
    ...v,
    distance: v.distance / amt,
  });
};

/**
 * Clamps the magnitude of a vector
 * @param v
 * @param max
 * @param min
 * @returns
 */
export const clampMagnitude = (v: PolarCoord, max = 1, min = 0): PolarCoord => {
  let mag = v.distance;
  if (mag > max) mag = max;
  if (mag < min) mag = min;
  return Object.freeze({
    ...v,
    distance: mag,
  });
};

/**
 * Converts a polar coordinate to Cartesian
 * @param distance Distance
 * @param angleRadians Angle in radians
 * @param origin Origin, or 0,0 by default.
 * @returns
 */
const polarToCartesian = (
  distance: number,
  angleRadians: number,
  origin: Point = Points.Empty
): Point => {
  Points.guard(origin);
  return Object.freeze({
    x: origin.x + distance * Math.cos(angleRadians),
    y: origin.y + distance * Math.sin(angleRadians),
  });
};

/**
 * Returns a human-friendly string representation `(distance, angleDeg)`.
 * If `precision` is supplied, this will be the number of significant digits.
 * @param p
 * @returns
 */
export const toString = (p: PolarCoord, digits?: number): string => {
  if (p === undefined) return `(undefined)`;
  if (p === null) return `(null)`;

  const angleDeg = radianToDegree(p.angleRadian);
  const d = digits ? p.distance.toFixed(digits) : p.distance;
  const a = digits ? angleDeg.toFixed(digits) : angleDeg;
  return `(${ d },${ a })`;
};

export const toPoint = (v: PolarCoord, origin = EmptyCartesian): Point => {
  guard(v, `v`);
  return Object.freeze({
    x: origin.x + v.distance * Math.cos(v.angleRadian),
    y: origin.y + v.distance * Math.sin(v.angleRadian),
  });
};
