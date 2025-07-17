import type { Point } from "../point/point-type.js";
import { guard, isPolarCoord } from "./guard.js";
import type { Coord, PolarToCartesian } from "./types.js";
import { subtract as subtractPoint } from "../point/subtract.js";
import { guard as guardPoint } from "../point/guard.js";
import { Empty as EmptyPoint } from '../point/empty.js';
import { isPoint } from "../point/guard.js";
import { radianToDegree } from "../angles.js";


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
export const toCartesian: PolarToCartesian = (
  a: Coord | number,
  b?: Point | number,
  c?: Point
): Point => {
  if (isPolarCoord(a)) {
    if (b === undefined) b = EmptyPoint;
    if (isPoint(b)) {
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
      if (c === undefined) c = EmptyPoint;
      if (!isPoint(c)) {
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
): Coord => {
  point = subtractPoint(point, origin);

  const angle = Math.atan2(point.y, point.x);
  return Object.freeze({
    ...point,
    angleRadian: angle,
    distance: Math.hypot(point.x, point.y),
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
  origin: Point = EmptyPoint
): Point => {
  guardPoint(origin);
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
export const toString = (p: Coord, digits?: number): string => {
  if (p === undefined) return `(undefined)`;
  if (p === null) return `(null)`;

  const angleDeg = radianToDegree(p.angleRadian);
  const d = digits ? p.distance.toFixed(digits) : p.distance;
  const a = digits ? angleDeg.toFixed(digits) : angleDeg;
  return `(${ d },${ a })`;
};

export const toPoint = (v: Coord, origin = EmptyPoint): Point => {
  guard(v, `v`);
  return Object.freeze({
    x: origin.x + v.distance * Math.cos(v.angleRadian),
    y: origin.y + v.distance * Math.sin(v.angleRadian),
  });
};