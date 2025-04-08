import type { Point } from "../point/point-type.js";
import { guard } from "./guard.js";
import type { Triangle } from "./triangle-type.js";

/**
 * Returns the corners (vertices) of the triangle as an array of points
 * @param t
 * @returns Array of length three
 */
export const corners = (t: Triangle): ReadonlyArray<Point> => {
  guard(t);
  return [ t.a, t.b, t.c ];
};