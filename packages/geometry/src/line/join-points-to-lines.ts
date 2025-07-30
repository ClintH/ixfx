import type { Point } from "../point/point-type.js";
import { fromPoints } from "./from-points.js";
import type { Line, PolyLine } from "./line-type.js";

/**
 * Returns an array of lines that connects provided points. Note that line is not closed.
 * 
 * Eg, if points a,b,c are provided, two lines are provided: a->b and b->c.
 * 
 * ```js
 * const lines = Lines.joinPointsToLines(ptA, ptB, ptC);
 * // lines is an array of, well, lines
 * ```
 * @param points 
 * @returns 
 */
export const joinPointsToLines = (...points: readonly Point[]): PolyLine => {
  const lines: Line[] = [];

  let start = points[ 0 ];

  for (let index = 1; index < points.length; index++) {
    lines.push(fromPoints(start, points[ index ]));
    start = points[ index ];
  }
  return lines;
};