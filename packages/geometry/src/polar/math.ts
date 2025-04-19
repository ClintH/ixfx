import { guard } from "./guard.js";
import type { Coord } from "./types.js";
import { throwNumberTest } from "@ixfx/guards"

export const normalise = (c: Coord): Coord => {
  //guard(v, `v`);
  if (c.distance === 0) throw new Error(`Cannot normalise vector of length 0`);
  return Object.freeze({
    ...c,
    distance: 1,
  });
};



/**
 * Clamps the magnitude of a vector
 * @param v
 * @param max
 * @param min
 * @returns
 */
export const clampMagnitude = (v: Coord, max = 1, min = 0): Coord => {
  let mag = v.distance;
  if (mag > max) mag = max;
  if (mag < min) mag = min;
  return Object.freeze({
    ...v,
    distance: mag,
  });
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
export const dotProduct = (a: Coord, b: Coord): number => {
  guard(a, `a`);
  guard(b, `b`);
  return a.distance * b.distance * Math.cos(b.angleRadian - a.angleRadian);
};


/**
 * Multiplies the magnitude of a coord by `amt`.
 * Direction is unchanged.
 * @param v
 * @param amt
 * @returns
 */
export const multiply = (v: Coord, amt: number): Coord => {
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
export const divide = (v: Coord, amt: number): Coord => {
  guard(v);
  throwNumberTest(amt, ``, `amt`);
  return Object.freeze({
    ...v,
    distance: v.distance / amt,
  });
};
