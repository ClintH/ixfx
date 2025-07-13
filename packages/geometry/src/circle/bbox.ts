import type { CirclePositioned, Circle } from "./circle-type.js";
import { isCirclePositioned } from "./guard.js";
import { fromCenter as RectsFromCenter } from '../rect/from-center.js';
import type { RectPositioned } from "../rect/rect-types.js";
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
