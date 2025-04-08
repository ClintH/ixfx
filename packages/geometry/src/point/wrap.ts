import { wrap as wrapNumber } from '@ixfxfun/numbers';
import { guard } from './guard.js';
import type { Point } from "./point-type.js";

/**
 * Wraps a point to be within `ptMin` and `ptMax`.
 * Note that max values are _exclusive_, meaning the return value will always be one less.
 *
 * Eg, if a view port is 100x100 pixels, wrapping the point 150,100 yields 50,99.
 *
 * ```js
 * // Wraps 150,100 to on 0,0 -100,100 range
 * wrap({x:150,y:100}, {x:100,y:100});
 * ```
 *
 * Wrap normalised point:
 * ```js
 * wrap({x:1.2, y:1.5}); // Yields: {x:0.2, y:0.5}
 * ```
 * @param pt Point to wrap
 * @param ptMax Maximum value, or `{ x:1, y:1 }` by default
 * @param ptMin Minimum value, or `{ x:0, y:0 }` by default
 * @returns Wrapped point
 */
export const wrap = (
  pt: Point,
  ptMax?: Point,
  ptMin?: Point
): Point => {

  if (ptMax === undefined) ptMax = { x: 1, y: 1 };
  if (ptMin === undefined) ptMin = { x: 0, y: 0 };

  // ✔️ Unit tested
  guard(pt, `pt`);
  guard(ptMax, `ptMax`);
  guard(ptMin, `ptMin`);

  return Object.freeze({
    x: wrapNumber(pt.x, ptMin.x, ptMax.x),
    y: wrapNumber(pt.y, ptMin.y, ptMax.y),
  });
};
