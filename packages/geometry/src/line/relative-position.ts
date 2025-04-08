import type { Point } from "../point/point-type.js";
import type { Line } from "./line-type.js";
import { length } from "./length.js";
import { distance as PointsDistance } from "../point/distance.js";
/**
 * Returns the relative position of `pt` along `line`.
 * Warning: assumes `pt` is actually on `line`. Results may be bogus if not.
 * @param line 
 * @param pt 
 */
export const relativePosition = (line: Line, pt: Point): number => {
  const fromStart = PointsDistance(line.a, pt);
  const total = length(line);
  return fromStart / total;
}