import type { Point } from "../point/PointType.js";
import type { Line } from "./LineType.js";
import { length } from "./Length.js";
import { distance as PointsDistance } from "../point/Distance.js";
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