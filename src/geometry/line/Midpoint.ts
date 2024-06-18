import type { Point } from "../point/PointType.js";
import { interpolate } from "./Interpolate.js";
import type { Line } from "./LineType.js";
import { getPointParameter } from "./GetPointsParameter.js";

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