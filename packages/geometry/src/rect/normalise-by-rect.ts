import { isPoint, isPoint3d } from "../point/guard.js";
import type { Point } from "../point/point-type.js"
import type { Rect } from "./rect-types.js"

/**
 * Returns a function that divides numbers or points by the largest dimension of `rect`.
 * 
 * ```js
 * const d = dividerByLargestDimension({width:100,height:50});
 * d(50);                // 0.5 (50/100)
 * d({ x: 10, y: 20 }); // { x: 0.1, y: 0.2 }
 * ```
 * @param rect 
 * @returns 
 */
export const dividerByLargestDimension = (rect: Rect) => {
  const largest = Math.max(rect.width, rect.height);
  return (value: number | Point): number | Point => {
    if (typeof value === `number`) {
      return value / largest;
    } else if (isPoint3d(value)) {
      return Object.freeze({
        ...value,
        x: value.x / largest,
        y: value.y / largest,
        z: value.x / largest
      });
    } else if (isPoint(value)) {
      return Object.freeze({
        ...value,
        x: value.x / largest,
        y: value.y / largest
      });
    } else throw new Error(`Param 'value' is neither number nor Point`);
  }
}