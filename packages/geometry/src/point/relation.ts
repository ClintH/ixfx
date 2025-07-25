import { angleRadian } from "./angle.js";
import { centroid } from "./centroid.js";
import { distance } from "./distance.js";
import { getPointParameter } from "./get-point-parameter.js";
import type { PointRelation } from "./point-relation-types.js";
import type { Point } from "./point-type.js";

/**
 * Tracks the relation between two points.
 * 
 * 1. Call `Points.relation` with the initial reference point
 * 2. You get back a function
 * 3. Call the function with a new point to compute relational information.
 * 
 * It computes angle, average, centroid, distance and speed.
 * 
 * ```js
 * // Reference point: 50,50
 * const t = Points.relation({x:50,y:50}); // t is a function
 *
 * // Invoke the returned function with a point
 * const relation = t({ x:0, y:0 }); // Juicy relational data
 * ```
 * 
 * Or with destructuring:
 * 
 * ```js
 * const { angle, distanceFromStart, distanceFromLast, average, centroid, speed } = t({ x:0,y:0 });
 * ```
 *
 * x & y coordinates can also be used as parameters:
 * ```js
 * const t = Points.relation(50, 50);
 * const result = t(0, 0);
 * // result.speed, result.angle ...
 * ```
 *
 * Note that intermediate values are not stored. It keeps the initial
 * and most-recent point. If you want to compute something over a set
 * of prior points, you may want to use {@link PointsTracker}
 * @param a Initial point, or x value
 * @param b y value, if first option is a number.
 * @returns
 */
export const relation = (a: Point | number, b?: number): PointRelation => {
  const start = getPointParameter(a, b);
  let totalX = 0;
  let totalY = 0;
  let count = 0;
  let lastUpdate = performance.now();
  let lastPoint = start;
  const update = (aa: Point | number, bb?: number) => {
    const p = getPointParameter(aa, bb);
    totalX += p.x;
    totalY += p.y;
    count++;

    const distanceFromStart = distance(p, start);
    const distanceFromLast = distance(p, lastPoint);

    // Track speed
    const now = performance.now();
    const speed = distanceFromLast / (now - lastUpdate);
    lastUpdate = now;

    lastPoint = p;

    return Object.freeze({
      angle: angleRadian(p, start),
      distanceFromStart,
      distanceFromLast,
      speed,
      centroid: centroid(p, start),
      average: {
        x: totalX / count,
        y: totalY / count,
      },
    });
  };

  return update;
};

