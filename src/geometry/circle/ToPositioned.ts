import type { Circle, CirclePositioned } from "./CircleType.js";
import { isCirclePositioned } from "./Guard.js";
import type { Point } from '../point/PointType.js';
import { getPointParameter } from "../point/GetPointParameter.js";


/**
 * Returns a positioned version of a circle.
 * If circle is already positioned, it is returned.
 * If no default position is supplied, 0,0 is used.
 * @param circle 
 * @param defaultPositionOrX 
 * @param y 
 * @returns 
 */
export const toPositioned = (circle: Circle | CirclePositioned, defaultPositionOrX?: Point | number, y?: number): CirclePositioned => {
  if (isCirclePositioned(circle)) return circle;

  // Returns 0,0 if params are undefined
  const pt = getPointParameter(defaultPositionOrX, y);
  return Object.freeze({
    ...circle,
    ...pt
  });
};