import { Points } from "../index.js";
import type { Point, Circle, CirclePositioned } from "../Types.js";
import { isCirclePositioned } from "./Guard.js";

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
  const pt = Points.getPointParameter(defaultPositionOrX, y);
  return Object.freeze({
    ...circle,
    ...pt
  });
};