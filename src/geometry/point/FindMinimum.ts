import type { Point } from "./PointType.js";

/**
 * Returns the 'minimum' point from an array of points, using a comparison function.
 *
 * @example Find point closest to a coordinate
 * ```js
 * const points = [...];
 * const center = {x: 100, y: 100};
 *
 * const closestToCenter = findMinimum((a, b) => {
 *  const aDist = distance(a, center);
 *  const bDist = distance(b, center);
 *  if (aDistance < bDistance) return a;
 *  return b;
 * }, points);
 * ```
 * @param comparer Compare function returns the smallest of `a` or `b`
 * @param points
 * @returns
 */
export const findMinimum = (
  comparer: (a: Point, b: Point) => Point,
  ...points: ReadonlyArray<Point>
): Point => {
  if (points.length === 0) throw new Error(`No points provided`);
  let min = points[ 0 ];
  for (const p of points) {
    min = comparer(min, p);
  }
  return min;
};