import type { Point } from "../point/point-type.js";
import type { Line } from "./line-type.js";
import { guard } from './guard.js';
import { guard as guardPoint } from '../point/guard.js';
import { length } from "./length.js";
import { nearest } from "./nearest.js";
/**
 * Returns the distance of `point` to the nearest point on `line`
 * 
 * ```js
 * const distance = Lines.distanceSingleLine(line, pt);
 * ```
 * @param line Line
 * @param point Target point
 * @returns 
 */
export const distanceSingleLine = (line: Line, point: Point): number => {
  guard(line, `line`);
  guardPoint(point, `point`);

  if (length(line) === 0) {
    // Line is really a point
    return length(line.a, point);
  }

  const near = nearest(line, point);
  return length(near, point);
};