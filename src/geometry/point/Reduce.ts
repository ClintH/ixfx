import type { Point } from "./PointType.js";

/**
 * Reduces over points, treating _x_ and _y_ separately.
 *
 * ```
 * // Sum x and y values
 * const total = Points.reduce(points, (p, acc) => {
 *  return {x: p.x + acc.x, y: p.y + acc.y}
 * });
 * ```
 * @param pts Points to reduce
 * @param fn Reducer
 * @param initial Initial value, uses `{ x:0, y:0 }` by default
 * @returns
 */
export const reduce = (
  pts: ReadonlyArray<Point>,
  fn: (p: Point, accumulated: Point) => Point,
  initial?: Point
): Point => {
  if (initial === undefined) initial = { x: 0, y: 0 }
  let accumulator = initial;
  for (const p of pts) {
    accumulator = fn(p, accumulator);
  };
  return accumulator;
};