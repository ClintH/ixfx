import type { Line } from './line/line-type.js';
import type { Point } from './point/point-type.js';
import { resultThrow } from '@ixfx/guards';
import { lineTest } from './line/guard.js';
import { distance as PointsDistance } from './point/distance.js';
import { divide as PointDivide } from './point/divider.js';
import { dotProduct as PointsDotProduct } from './point/dot-product.js';
import { Empty as PointEmpty } from './point/empty.js';
import { isPoint } from './point/guard.js';
import { subtract as PointsSubtract } from './point/index.js';
import { clampMagnitude as PointsClampMagnitude } from './point/magnitude.js';
import { multiply as PointsMultiply } from './point/multiply.js';
import { normalise as PointsNormalise } from './point/normalise.js';
import { sum as PointsSum } from './point/sum.js';
import { toString as PointsToString } from './point/to.js';
import * as Polar from './polar/index.js';

export type Vector = Point | Polar.Coord;

const EmptyCartesian = Object.freeze({ x: 0, y: 0 });

const piPi = Math.PI * 2;
const pi = Math.PI;

// const Q1 = Math.PI / 2;
// const Q2 = Math.PI;
// const Q3 = Q1 + Q2;
// const Q4 = Math.PI * 2;

export function fromRadians(radians: number): Point {
  return Object.freeze({
    x: Math.cos(radians),
    y: Math.sin(radians),
  });
}

export function toRadians(point: Point): number {
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
export function fromPointPolar(pt: Point, angleNormalisation: `` | `unipolar` | `bipolar` = ``, origin: Point = EmptyCartesian): Polar.Coord {
  pt = PointsSubtract(pt, origin);

  let direction = Math.atan2(pt.y, pt.x);
  if (angleNormalisation === `unipolar` && direction < 0) {
    direction += piPi;
  } else if (angleNormalisation === `bipolar`) {
    if (direction > pi)
      direction -= piPi;
    else if (direction <= -pi)
      direction += piPi;
  }

  return Object.freeze({
    distance: PointsDistance(pt),
    angleRadian: direction,
  });
}

/**
 * Returns a Cartesian-coordinate vector from a line a -> b
 * @param line
 * @returns
 */
export function fromLineCartesian(line: Line): Point {
  return PointsSubtract(line.b, line.a);
}

/**
 * Returns a polar-coordinate vector from a line a -> b
 * @param line
 * @returns
 */
export function fromLinePolar(line: Line): Polar.Coord {
  resultThrow(lineTest(line, `line`));

  const pt = PointsSubtract(line.b, line.a);
  return fromPointPolar(pt);
}

function isPolar(v: Vector): v is Polar.Coord {
  if (Polar.isPolarCoord(v))
    return true;
  return false;
}

function isCartesian(v: Vector): v is Point {
  if (isPoint(v))
    return true;
  return false;
}

/**
 * Returns the normalised vector (aka unit vector). This is where
 * direction is kept, but magnitude set to 1. This then just
 * suggests direction.
 * @param v
 * @returns
 */
export function normalise(v: Vector): Vector {
  if (isPolar(v)) {
    return Polar.normalise(v);
  } else if (isCartesian(v)) {
    return PointsNormalise(v);
  }

  throw new Error(`Expected polar/cartesian vector. Got: ${v}`);
}

export function quadrantOffsetAngle(p: Point): number {
  if (p.x >= 0 && p.y >= 0)
    return 0; // Q1
  if (p.x < 0 && p.y >= 0)
    return pi; // Q2
  if (p.x < 0 && p.y < 0)
    return pi; // Q3
  return piPi; // Q4
}

/**
 * Converts a vector to a polar coordinate. If the provided
 * value is already Polar, it is returned.
 * @param v
 * @param origin
 * @returns Polar vector
 */
export function toPolar(v: Vector, origin: Point = PointEmpty): Polar.Coord {
  if (isPolar(v)) {
    return v;
  } else if (isCartesian(v)) {
    return Polar.fromCartesian(v, origin);
  }

  throw new Error(`Expected polar/cartesian vector. Got: ${v}`);
}

/**
 * Converts a Vector to a Cartesian coordinate. If the provided
 * value is already Cartesian, it is returned.
 * @param v
 * @returns Cartestian vector
 */
export function toCartesian(v: Vector): Point {
  if (isPolar(v)) {
    return Polar.toPoint(v);
  } else if (isCartesian(v)) {
    return v;
  }

  throw new Error(`Expected polar/cartesian vector. Got: ${v}`);
}

/**
 * Return a human-friendly representation of vector
 * @param v
 * @param digits
 * @returns
 */
export function toString(v: Vector, digits?: number): string {
  if (isPolar(v)) {
    return Polar.toString(v, digits);
  } else if (isCartesian(v)) {
    return PointsToString(v, digits);
  }

  throw new Error(`Expected polar/cartesian vector. Got: ${v}`);
}

/**
 * Calculate dot product of a vector
 * @param a
 * @param b
 * @returns
 */
export function dotProduct(a: Vector, b: Vector): number {
  if (isPolar(a) && isPolar(b)) {
    return Polar.dotProduct(a, b);
  } else if (isCartesian(a) && isCartesian(b)) {
    return PointsDotProduct(a, b);
  }
  throw new Error(`Expected two polar/Cartesian vectors.`);
}

/**
 * Clamps the magnitude of a vector
 * @param v Vector to clamp
 * @param max Maximum magnitude
 * @param min Minium magnitude
 * @returns
 */
export function clampMagnitude(v: Vector, max = 1, min = 0): Point | Readonly<{
  distance: number;
  angleRadian: number;
}> {
  if (isPolar(v)) {
    return Polar.clampMagnitude(v, max, min);
  } else if (isCartesian(v)) {
    return PointsClampMagnitude(v, max, min);
  }
  throw new Error(`Expected either polar or Cartesian vector`);
}

/**
 * Returns `a + b`.
 *
 * Vector is returned in the same type as `a`.
 * @param a
 * @param b
 * @returns
 */
export function sum(a: Vector, b: Vector): Point | Readonly<{
  distance: number;
  angleRadian: number;
}> {
  const polar = isPolar(a);
  a = toCartesian(a);
  b = toCartesian(b);
  const c = PointsSum(a, b);
  return polar ? toPolar(c) : c;
}

/**
 * Returns `a - b`.
 *
 * Vector is returned in the same type as `a`
 * @param a
 * @param b
 */
export function subtract(a: Vector, b: Vector): Point | Readonly<{
  distance: number;
  angleRadian: number;
}> {
  const polar = isPolar(a);
  a = toCartesian(a);
  b = toCartesian(b);
  const c = PointsSubtract(a, b);
  return polar ? toPolar(c) : c;
}

/**
 * Returns `a * b`.
 *
 * Vector is returned in the same type `a`.
 * @param a
 * @param b
 */
export function multiply(a: Vector, b: Vector): Point | Readonly<{
  distance: number;
  angleRadian: number;
}> {
  const polar = isPolar(a);
  a = toCartesian(a);
  b = toCartesian(b);
  const c = PointsMultiply(a, b);
  return polar ? toPolar(c) : c;
}

/**
 * Returns `a / b`.
 *
 * Vector is returned in the same type `a`.
 * @param a
 * @param b
 */
export function divide(a: Vector, b: Vector): Point | Readonly<{
  distance: number;
  angleRadian: number;
}> {
  const polar = isPolar(a);
  a = toCartesian(a);
  b = toCartesian(b);
  const c = PointDivide(a, b);
  return polar ? toPolar(c) : c;
}
