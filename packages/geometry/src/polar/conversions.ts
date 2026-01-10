import type { Point } from "../point/point-type.js";
import { guard, isPolarCoord } from "./guard.js";
import type { Coord, PolarLine, PolarToCartesian } from "./types.js";
import { subtract as subtractPoint } from "../point/subtract.js";
import { guard as guardPoint } from "../point/guard.js";
import { Empty as EmptyPoint } from '../point/empty.js';
import { isPoint } from "../point/guard.js";
import { radianRange, radiansNormalise, radianToDegree } from "../angles.js";
import type { Line } from "../line/line-type.js";
import { piPi } from "../pi.js";

/**
 * Converts a polar coordinate to a Line.
 * 
 * ```js
 * const line = toLine({ angleRadian: Math.Pi, distance: 0.5 }, { x: 0.2, y: 0.1 });
 * // Yields { a: { x, y}, b: { x, y } }
 * ```
 * 
 * The 'start' parameter is taken to be the origin of the Polar coordinate.
 * @param c 
 * @param start 
 * @returns 
 */
export const toLine = (c: Coord, start: Point): Line => {
  const b = toCartesian(c, start);
  return { a: start, b }
}

/**
 * Converts to Cartesian coordinate from polar.
 *
 * ```js
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
    if (typeof b === `undefined`) b = EmptyPoint;
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
      if (typeof c === `undefined`) c = EmptyPoint;
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

export type FromCartesianOptions = {
  /**
   * Rounding to apply to distance and angle calculations
   */
  digits: number
  /**
   * If false, returns angle on half-circle basis 
   * such that negative angles are possible (0..PI..-PI).
   * By default uses (0..2*PI) range.
   */
  fullCircle: boolean
}
/**
 * Converts a Cartesian coordinate to polar
 *
 * ```js
 *
 * // Yields: { angleRadian, distance }
 * const polar = Polar.fromCartesian({x: 50, y: 50}, origin);
 * ```
 *
 * Any additional properties of `point` are copied to object.
 * 
 * Options:
 * * fullCircle: If _true_ (default) returns values on 0..2PI range. If _false_, 0....PI..-PI range.
 * * digits: Rounding to apply
 * @param point Point
 * @param origin Origin. If unspecified, {x:0,y:0} is used
 * @param options Options
 * @returns
 */
export const fromCartesian = (
  point: Point,
  origin?: Point,
  options: Partial<FromCartesianOptions> = {}
): Coord => {
  if (typeof point !== `object`) throw new TypeError(`Param 'point' wrong. Expecting a Point, got: ${ typeof point }`);
  const fullCircle = options.fullCircle ?? true;
  // If a non-zero origin is provided, adjust point
  if (typeof origin === `object`) {
    point = subtractPoint(point, origin);
  }

  let angle = Math.atan2(point.y, point.x);
  if (fullCircle) angle = radiansNormalise(angle);

  //if (angle < 0 && fullCircle) angle += piPi
  let distance = Math.hypot(point.x, point.y);

  if (typeof options.digits === `number`) {
    angle = parseFloat(angle.toFixed(options.digits));
    distance = parseFloat(distance.toFixed(options.digits));
  }

  const polar = {
    ...point,
    angleRadian: angle,
    distance,
  };
  delete (polar as any).x;
  delete (polar as any).y;
  return Object.freeze(polar);
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

export const toPoint = (v: Coord, origin: Point = EmptyPoint): Point => {
  guard(v, `v`);
  return Object.freeze({
    x: origin.x + v.distance * Math.cos(v.angleRadian),
    y: origin.y + v.distance * Math.sin(v.angleRadian),
  });
};


export type ToPolarLineOptions = FromCartesianOptions & {
  orderBy: `none` | `angle-min` | `angle-max` | `distance`
}
export function toPolarLine(line: Line, origin: Point, opts?: Partial<ToPolarLineOptions>): PolarLine;
export function toPolarLine(lines: Line[] | readonly Line[], origin: Point, opts?: Partial<ToPolarLineOptions>): PolarLine[]


/**
 * Converts a line to a PolarLine
 * 
 * A/B points of the line can optionally be reordered based on angle or distance.
 * @param lineOrLines 
 * @param origin 
 * @param orderBy Whether a/b points are reordered based on `angle` or `distance`. Default: `none`
 * @returns 
 */
export function toPolarLine(lineOrLines: Line | Line[] | readonly Line[], origin: Point, opts: Partial<ToPolarLineOptions> = {}): PolarLine | PolarLine[] {
  const lines = Array.isArray(lineOrLines) ? lineOrLines : [ lineOrLines as Line ];
  if (lines.length === 0) return [];
  const orderBy = opts.orderBy ?? `none`;
  const pl = lines.map(line => {
    let a = fromCartesian(line.a, origin, opts);
    let b = fromCartesian(line.b, origin, opts);
    const ranges = radianRange(a.angleRadian, b.angleRadian);
    if (orderBy === `angle-min` && ranges.min.start !== a.angleRadian) {
      [ a, b ] = [ b, a ];
    } else if (orderBy === `angle-max` && ranges.max.start < a.angleRadian) {
      [ a, b ] = [ b, a ];
    } else if (orderBy === `distance` && b.distance < a.distance) {
      [ a, b ] = [ b, a ];
    }
    return Object.freeze({ a, b, origin });
  });
  if (Array.isArray(lineOrLines)) return pl;
  return pl[ 0 ];
}

/**
 * Returns a string representation of a PolarLine
 * @param line 
 * @param digits 
 * @returns 
 */
export function polarLineToString(line: PolarLine, digits = 2): string {
  return `angle: ${ line.a.angleRadian.toFixed(digits) }-${ line.b.angleRadian.toFixed(digits) } dist: ${ line.a.distance.toFixed(digits) }-${ line.b.distance.toFixed(digits) }`
}

export function lineToCartesian(line: PolarLine, origin: Point): Line;
export function lineToCartesian(lines: PolarLine[], origin: Point): Line[];
export function lineToCartesian(lineOrLines: PolarLine | PolarLine[], origin: Point): Line | Line[] {
  const lines = Array.isArray(lineOrLines) ? lineOrLines : [ lineOrLines ];
  if (lines.length === 0) return [];
  const cart = lines.map(line => Object.freeze({
    a: toCartesian(line.a, origin),
    b: toCartesian(line.b, origin)
  }));
  if (Array.isArray(lineOrLines)) return cart;
  return cart[ 0 ];
}


