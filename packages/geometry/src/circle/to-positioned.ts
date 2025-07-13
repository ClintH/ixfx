import type { Circle, CirclePositioned } from "./circle-type.js";
import { isCirclePositioned } from "./guard.js";
import type { Point } from '../point/point-type.js';
import { getPointParameter } from "../point/get-point-parameter.js";


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