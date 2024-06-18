import type { Point } from "../point/PointType.js";
import type { Line } from "./LineType.js";
import { guard } from './Guard.js';
import { guard as guardPoint } from '../point/Guard.js';
import { length } from "./Length.js";
import { nearest } from "./Nearest.js";
/**
 * Returns the distance of `point` to the nearest point on `line`
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
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