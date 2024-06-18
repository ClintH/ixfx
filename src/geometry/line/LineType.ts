import type { Point } from "../point/PointType.js";

/**
 * A line, which consists of an `a` and `b` {@link Point}.
 */
export type Line = {
  readonly a: Point
  readonly b: Point
}

/**
 * A PolyLine, consisting of more than one line.
 */
export type PolyLine = ReadonlyArray<Line>;
