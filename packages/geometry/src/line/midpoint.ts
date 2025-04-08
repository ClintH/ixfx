import type { Point } from "../point/point-type.js";
import { interpolate } from "./interpolate.js";
import type { Line } from "./line-type.js";
import { getPointParameter } from "./get-points-parameter.js";

/**
 * Returns the mid-point of a line (same as `interpolate` with an amount of 0.5)
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * Lines.midpoint(line); // Returns {x, y}
 * ```
 * @param aOrLine 
 * @param pointB 
 * @returns 
 */
export const midpoint = (aOrLine: Point | Line, pointB?: Point): Point => {
  const [ a, b ] = getPointParameter(aOrLine, pointB);
  return interpolate(0.5, a, b);
};