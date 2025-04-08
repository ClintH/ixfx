import { isPoint3d } from "./guard.js";
import type { Point, Point3d } from "./point-type.js";

export function findMinimum(
  comparer: (a: Point, b: Point) => Point,
  ...points: ReadonlyArray<Point>
): Point;

export function findMinimum(
  comparer: (a: Point3d, b: Point3d) => Point3d,
  ...points: ReadonlyArray<Point3d>
): Point3d;

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
export function findMinimum(
  comparer: ((a: Point, b: Point) => Point)|((a: Point3d, b: Point3d) => Point3d),
  ...points: ReadonlyArray<Point|Point3d>
): Point|Point3d  {
  if (points.length === 0) throw new Error(`No points provided`);
  let min = points[ 0 ];
  for (const p of points) {
    if (isPoint3d(min) && isPoint3d(p)) {
      min = comparer(min, p);
    } else {
      min = comparer(min as any, p as any);
    }
  }
  return min;
};