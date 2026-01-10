import type { Point } from "../point/point-type.js";
import type { Triangle } from "./triangle-type.js";

/**
 * Applies `fn` to each of a triangle's corner points, returning the result.
 *
 * @example Add some random to the x of each corner
 * ```
 * const t = apply(tri, p => {
 *  const r = 10;
 *  return {
 *    x: p.x + (Math.random()*r*2) - r,
 *    y: p.y
 *  }
 * });
 * ```
 * @param t
 * @param fn
 * @returns
 */
export const apply = (
  t: Triangle,
  fn: (p: Point, label?: string) => Point
): Triangle =>
  Object.freeze<Triangle>({
    ...t,
    a: fn(t.a, `a`),
    b: fn(t.b, `b`),
    c: fn(t.c, `c`),
  });