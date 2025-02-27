import { guard } from "./Guard.js";
import type { Coord } from "./Types.js";
import { degreeToRadian } from '../Angles.js';

/**
 * Returns a rotated coordinate
 * @param c Coordinate
 * @param amountRadian Amount to rotate, in radians
 * @returns
 */
export const rotate = (c: Coord, amountRadian: number): Coord =>
  Object.freeze({
    ...c,
    angleRadian: c.angleRadian + amountRadian,
  });

/**
 * Inverts the direction of coordinate. Ie if pointing north, will point south.
 * @param p
 * @returns
 */
export const invert = (p: Coord): Coord => {
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
export const isOpposite = (a: Coord, b: Coord): boolean => {
  guard(a, `a`);
  guard(b, `b`);
  if (a.distance !== b.distance) return false;
  return a.angleRadian === -b.angleRadian;
};

/**
 * Returns true if Coords have the same direction, regardless of magnitude
 * @param a
 * @param b
 * @returns
 */
export const isParallel = (a: Coord, b: Coord): boolean => {
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
export const isAntiParallel = (a: Coord, b: Coord): boolean => {
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
export const rotateDegrees = (c: Coord, amountDeg: number): Coord =>
  Object.freeze({
    ...c,
    angleRadian: c.angleRadian + degreeToRadian(amountDeg),
  });

