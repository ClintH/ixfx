import { guard } from "./Guard.js";
import type { Point } from "./PointType.js";

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