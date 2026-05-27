import type { Point } from "../point/point-type.js";
import type { Line } from "./line-type.js";
import { resultThrow } from "@ixfx/guards";
import { pointTest } from "../point/guard.js";
import { lineTest } from './guard.js';
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
export function distanceSingleLine(line: Line, point: Point): number {
  resultThrow(lineTest(line, `line`), pointTest(point, `point`));

  if (length(line) === 0) {
    // Line is really a point
    return length(line.a, point);
  }

  const near = nearest(line, point);
  return length(near, point);
}