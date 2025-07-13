import type { Point } from "../point/point-type.js";
import type { Circle, CirclePositioned, CircleRandomPointOpts } from "./circle-type.js";
import { isCirclePositioned } from "./guard.js";
import { sum as PointsSum } from "../point/sum.js";
import { toCartesian as PolarToCartesian } from "../polar/index.js";
const piPi = Math.PI * 2;
/**
 * Returns a random point within a circle.
 * 
 * By default creates a uniform distribution.
 * 
 * ```js
 * const pt = randomPoint({radius: 5});
 * const pt = randomPoint({radius: 5, x: 10, y: 20});
 * ```'
 * 
 * Generate points with a gaussian distribution
 * ```js
 * const pt = randomPoint(circle, {
 *  randomSource: Random.gaussian
 * })
 * ```
 * @param within Circle to generate a point within
 * @param opts Options
 * @returns 
 */
export const randomPoint = (within: Circle | CirclePositioned, opts: Partial<CircleRandomPointOpts> = {}): Point => {
  const offset: Point = isCirclePositioned(within) ? within : { x: 0, y: 0 };
  const strategy = opts.strategy ?? `uniform`;
  const margin = opts.margin ?? 0;
  const radius = within.radius - margin;
  const rand = opts.randomSource ?? Math.random;
  switch (strategy) {
    case `naive`: {
      return PointsSum(offset, PolarToCartesian(rand() * radius, rand() * piPi));
    }
    case `uniform`: {
      return PointsSum(offset, PolarToCartesian(Math.sqrt(rand()) * radius, rand() * piPi));
    }
    default: {

      throw new Error(`Unknown strategy '${ strategy }'. Expects 'uniform' or 'naive'`);
    }
  }
};