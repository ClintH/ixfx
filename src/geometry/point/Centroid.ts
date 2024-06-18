import { isPoint } from "./Guard.js";
import type { Point } from "./PointType.js";

/**
 * Calculates the [centroid](https://en.wikipedia.org/wiki/Centroid#Of_a_finite_set_of_points) of a set of points
 * Undefined values are skipped over.
 *
 * ```js
 * // Find centroid of a list of points
 * const c1 = centroid(p1, p2, p3, ...);
 *
 * // Find centroid of an array of points
 * const c2 = centroid(...pointsArray);
 * ```
 * @param points
 * @returns A single point
 */
export const centroid = (...points: ReadonlyArray<Point | undefined>): Point => {
  if (!Array.isArray(points)) throw new Error(`Expected list of points`);
  // eslint-disable-next-line unicorn/no-array-reduce
  const sum = points.reduce<Point>(
    (previous, p) => {
      if (p === undefined) return previous; // Ignore undefined
      if (Array.isArray(p)) {
        throw new TypeError(
          `'points' list contains an array. Did you mean: centroid(...myPoints)?`
        );
      }
      if (!isPoint(p)) {
        throw new Error(
          `'points' contains something which is not a point: ${ JSON.stringify(
            p
          ) }`
        );
      }
      return {
        x: previous.x + p.x,
        y: previous.y + p.y,
      };
    },
    { x: 0, y: 0 }
  );

  return Object.freeze({
    x: sum.x / points.length,
    y: sum.y / points.length,
  });
};

