import type { Line } from './line/index.js';
import * as Lines from './line/index.js';
import type { Point } from './point/index.js';
import * as Points from './point/index.js'
import * as Polar from './Polar.js';
import type { Vector } from './Types.js';
//eslint-disable-next-line @typescript-eslint/naming-convention
const EmptyCartesian = Object.freeze({ x: 0, y: 0 });

const piPi = Math.PI * 2;
const pi = Math.PI;

// const Q1 = Math.PI / 2;
// const Q2 = Math.PI;
// const Q3 = Q1 + Q2;
// const Q4 = Math.PI * 2;

export const fromRadians = (radians: number) => {
  return Object.freeze({
    x: Math.cos(radians),
    y: Math.sin(radians)
  });
}

export const toRadians = (point: Point) => {
  return Math.atan2(point.y, point.x);
}
/**
 * Create a vector from a point
 *
 * If `unipolar` normalisation is used, direction will be fixed to 0..2π
 * if `bipolar` normalisation is used, direction will be fixed to -π...π
 * @param pt Point
 * @param angleNormalisation Technique to normalise angle
 * @param origin Origin to calculate vector from or 0,0 if left empty
 * @returns
 */
export const fromPointPolar = (
  pt: Point,
  angleNormalisation: `` | `unipolar` | `bipolar` = ``,
  origin: Point = EmptyCartesian
): Polar.Coord => {
  pt = Points.subtract(pt, origin);

  //eslint-disable-next-line functional/no-let
  let direction = Math.atan2(pt.y, pt.x);
  if (angleNormalisation === `unipolar` && direction < 0) direction += piPi;
  else if (angleNormalisation === `bipolar`) {
    if (direction > pi) direction -= piPi;
    else if (direction <= -pi) direction += piPi;
  }

  return Object.freeze({
    distance: Points.distance(pt),
    angleRadian: direction,
  });
};

/**
 * Returns a Cartesian-coordinate vector from a line a -> b
 * @param line
 * @returns
 */
export const fromLineCartesian = (line: Line): Points.Point =>
  Points.subtract(line.b, line.a);

/**
 * Returns a polar-coordinate vector from a line a -> b
 * @param line
 * @returns
 */
export const fromLinePolar = (line: Line): Polar.Coord => {
  Lines.guard(line, `line`);
  const pt = Points.subtract(line.b, line.a);
  return fromPointPolar(pt);
};

const isPolar = (v: Vector): v is Polar.Coord => {
  if (Polar.isPolarCoord(v)) return true;
  return false;
};

const isCartesian = (v: Vector): v is Point => {
  if (Points.isPoint(v)) return true;
  return false;
};

/**
 * Returns the normalised vector (aka unit vector). This is where
 * direction is kept, but magnitude set to 1. This then just
 * suggests direction.
 * @param v
 * @returns
 */
export const normalise = (v: Vector): Vector => {
  if (isPolar(v)) {
    return Polar.normalise(v);
  } else if (isCartesian(v)) {
    return Points.normalise(v);
  }
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`Expected polar/cartesian vector. Got: ${ v }`);
};

export const quadrantOffsetAngle = (p: Point): number => {
  if (p.x >= 0 && p.y >= 0) return 0; // Q1
  if (p.x < 0 && p.y >= 0) return pi; // Q2
  if (p.x < 0 && p.y < 0) return pi; // Q3
  return piPi; // Q4
};

/**
 * Converts a vector to a polar coordinate. If the provided
 * value is already Polar, it is returned.
 * @param v
 * @param origin
 * @returns Polar vector
 */
export const toPolar = (v: Vector, origin = Points.Empty): Polar.Coord => {
  if (isPolar(v)) {
    return v;
  } else if (isCartesian(v)) {
    return Polar.fromCartesian(v, origin);
  }
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`Expected polar/cartesian vector. Got: ${ v }`);
};

/**
 * Converts a Vector to a Cartesian coordinate. If the provided
 * value is already Cartesian, it is returned.
 * @param v
 * @returns Cartestian vector
 */
export const toCartesian = (v: Vector): Point => {
  if (isPolar(v)) {
    return Polar.toPoint(v);
  } else if (isCartesian(v)) {
    return v;
  }
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`Expected polar/cartesian vector. Got: ${ v }`);
};

/**
 * Return a human-friendly representation of vector
 * @param v
 * @param digits
 * @returns
 */
export const toString = (v: Vector, digits?: number) => {
  if (isPolar(v)) {
    return Polar.toString(v, digits);
  } else if (isCartesian(v)) {
    return Points.toString(v, digits);
  }
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`Expected polar/cartesian vector. Got: ${ v }`);
};

/**
 * Calculate dot product of a vector
 * @param a
 * @param b
 * @returns
 */
export const dotProduct = (a: Vector, b: Vector) => {
  if (isPolar(a) && isPolar(b)) {
    return Polar.dotProduct(a, b);
  } else if (isCartesian(a) && isCartesian(b)) {
    return Points.dotProduct(a, b);
  }
  throw new Error(`Expected two polar/Cartesian vectors.`);
};

/**
 * Clamps the magnitude of a vector
 * @param v Vector to clamp
 * @param max Maximum magnitude
 * @param min Minium magnitude
 * @returns
 */
export const clampMagnitude = (v: Vector, max = 1, min = 0) => {
  if (isPolar(v)) {
    return Polar.clampMagnitude(v, max, min);
  } else if (isCartesian(v)) {
    return Points.clampMagnitude(v, max, min);
  }
  throw new Error(`Expected either polar or Cartesian vector`);
};

/**
 * Returns `a + b`.
 *
 * Vector is returned in the same type as `a`.
 * @param a
 * @param b
 * @returns
 */
export const sum = (a: Vector, b: Vector) => {
  const polar = isPolar(a);
  a = toCartesian(a);
  b = toCartesian(b);
  const c = Points.sum(a, b);
  return polar ? toPolar(c) : c;
};

/**
 * Returns `a - b`.
 *
 * Vector is returned in the same type as `a`
 * @param a
 * @param b
 */
export const subtract = (a: Vector, b: Vector) => {
  const polar = isPolar(a);
  a = toCartesian(a);
  b = toCartesian(b);
  const c = Points.subtract(a, b);
  return polar ? toPolar(c) : c;
};

/**
 * Returns `a * b`.
 *
 * Vector is returned in the same type `a`.
 * @param a
 * @param b
 */
export const multiply = (a: Vector, b: Vector) => {
  const polar = isPolar(a);
  a = toCartesian(a);
  b = toCartesian(b);
  const c = Points.multiply(a, b);
  return polar ? toPolar(c) : c;
};

/**
 * Returns `a / b`.
 *
 * Vector is returned in the same type `a`.
 * @param a
 * @param b
 */
export const divide = (a: Vector, b: Vector) => {
  const polar = isPolar(a);
  a = toCartesian(a);
  b = toCartesian(b);
  const c = Points.divide(a, b);
  return polar ? toPolar(c) : c;
};
