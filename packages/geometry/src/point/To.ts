import { guard } from "./guard.js";
import type { Point, Point3d } from "./point-type.js";

/**
 * Returns a point with rounded x,y coordinates. By default uses `Math.round` to round.
 * ```js
 * toIntegerValues({x:1.234, y:5.567}); // Yields: {x:1, y:6}
 * ```
 *
 * ```js
 * toIntegerValues(pt, Math.ceil); // Use Math.ceil to round x,y of `pt`.
 * ```
 * @param pt Point to round
 * @param rounder Rounding function, or Math.round by default
 * @returns
 */
export const toIntegerValues = (
  pt: Point,
  rounder: (x: number) => number = Math.round
): Point => {
  guard(pt, `pt`);
  return Object.freeze({
    x: rounder(pt.x),
    y: rounder(pt.y),
  });
};

/**
 * Returns a copy of `pt` with `z` field omitted.
 * If it didn't have one to begin within, a copy is still returned.
 * @param pt 
 * @returns 
 */
export const to2d = (pt: Point): Point => {
  guard(pt, `pt`);
  let copy = {
    ...pt
  };
  delete copy.z;
  return Object.freeze(copy);
}

/**
 * Returns a copy of `pt` with a `z` field set.
 * Defaults to a z value of 0.
 * @param pt Point
 * @param z Z-value, defaults to 0
 * @returns 
 */
export const to3d = (pt: Point, z: number = 0): Point3d => {
  guard(pt, `pt`);
  return Object.freeze({
    ...pt,
    z
  });
}

/**
 * Returns a human-friendly string representation `(x, y)`.
 * If `precision` is supplied, this will be the number of significant digits.
 * @param p
 * @returns
 */
export function toString(p: Point, digits?: number): string {
  if (p === undefined) return `(undefined)`;
  if (p === null) return `(null)`;
  guard(p, `pt`);

  const x = digits ? p.x.toFixed(digits) : p.x;
  const y = digits ? p.y.toFixed(digits) : p.y;

  if (p.z === undefined) {
    return `(${ x },${ y })`;
  } else {
    const z = digits ? p.z.toFixed(digits) : p.z;
    return `(${ x },${ y },${ z })`;
  }
}