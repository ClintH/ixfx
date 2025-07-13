import type { Point } from "../point/point-type.js";
import { guard } from "./guard.js";
import type { Triangle } from "./triangle-type.js";
import { reduce as PointsReduce } from '../point/index.js';

/**
 * Returns simple centroid of triangle
 * @param t
 * @returns
 */
export const centroid = (t: Triangle): Point => {
  guard(t);
  const total = PointsReduce(
    [ t.a, t.b, t.c ],
    (p: Point, accumulator: Point) => ({
      x: p.x + accumulator.x,
      y: p.y + accumulator.y,
    })
  );
  const div = {
    x: total.x / 3,
    y: total.y / 3,
  };
  return div;
};