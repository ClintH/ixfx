import { Empty } from "./Empty.js";
import { getPointParameter } from "./GetPointParameter.js";
import { isPoint } from "./Guard.js";
import type { Point } from "./PointType.js";

const length = (ptOrX: Point | number, y?: number): number => {
  if (isPoint(ptOrX)) {
    y = ptOrX.y;
    ptOrX = ptOrX.x;
  }
  if (y === undefined) throw new Error(`Expected y`);
  return Math.hypot(ptOrX, y);
};



/**
 * Normalise point as a unit vector.
 *
 * ```js
 * normalise({x:10, y:20});
 * normalise(10, 20);
 * ```
 * @param ptOrX Point, or x value
 * @param y y value if first param is x
 * @returns
 */
export const normalise = (ptOrX: Point | number, y?: number): Point => {
  const pt = getPointParameter(ptOrX, y);
  const l = length(pt);
  if (l === 0) return Empty;
  return Object.freeze({
    ...pt,
    x: pt.x / l,
    y: pt.y / l,
  });
};