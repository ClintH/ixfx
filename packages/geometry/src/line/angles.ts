import { interpolate } from "./interpolate.js";
import type { Line } from "./line-type.js";
import { length } from "./length.js";
import type { Point } from "../point/point-type.js";

const directionVector = (line: Line): Point => ({
  x: line.b.x - line.a.x,
  y: line.b.y - line.a.y
});



const directionVectorNormalised = (line: Line): Point => {
  const l = length(line);
  const v = directionVector(line);
  return {
    x: v.x / l,
    y: v.y / l
  };
};

/**
 * Returns a parallel line to `line` at `distance`.
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const l = Lines.parallel(line, 10);
 * ```
 * @param line
 * @param distance 
 */
export const parallel = (line: Line, distance: number): Line => {
  const dv = directionVector(line);
  const dvn = directionVectorNormalised(line);
  const a = {
    x: line.a.x - dvn.y * distance,
    y: line.a.y + dvn.x * distance
  };
  return {
    a,
    b: {
      x: a.x + dv.x,
      y: a.y + dv.y
    }
  };
};

/**
 * Returns a point perpendicular to `line` at a specified `distance`. Use negative
 * distances for the other side of line.
 * ```
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * // Project a point 100 units away from line, at its midpoint.
 * const pt = Lines.perpendicularPoint(line, 100, 0.5);
 * ```
 * @param line Line
 * @param distance Distance from line. Use negatives to flip side
 * @param amount Relative place on line to project point from. 0 projects from A, 0.5 from the middle, 1 from B.
 */
export const perpendicularPoint = (line: Line, distance: number, amount = 0) => {
  const origin = interpolate(amount, line);
  const dvn = directionVectorNormalised(line);
  return {
    x: origin.x - dvn.y * distance,
    y: origin.y + dvn.x * distance
  };
};
