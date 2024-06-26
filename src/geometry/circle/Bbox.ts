import type { RectPositioned } from "../Types.js";
import type { CirclePositioned, Circle } from "./CircleType.js";
import { isCirclePositioned } from "./Guard.js";
import { fromCenter as RectsFromCenter } from '../rect/FromCenter.js';
/**
 * Computes a bounding box that encloses circle
 * @param circle
 * @returns 
 */
export const bbox = (circle: CirclePositioned | Circle): RectPositioned => {
  return isCirclePositioned(circle) ?
    RectsFromCenter(circle, circle.radius * 2, circle.radius * 2) :
    { width: circle.radius * 2, height: circle.radius * 2, x: 0, y: 0 };
};
