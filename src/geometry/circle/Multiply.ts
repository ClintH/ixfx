import type { CirclePositioned, Circle } from "./CircleType.js";
import { isCirclePositioned } from "./Guard.js";
import { multiplyScalar as PointsMultiplyScalar } from '../point/Multiply.js';

export function multiplyScalar(a: CirclePositioned, value: number): CirclePositioned;
export function multiplyScalar(a: Circle, value: number): Circle;

/**
 * Multiplies a circle's radius and position (if provided) by `value`.
 * 
 * ```js
 * multiplyScalar({ radius: 5 }, 5);
 * // Yields: { radius: 25 }
 * 
 * multiplyScalar({ radius: 5, x: 10, y: 20 }, 5);
 * // Yields: { radius: 25, x: 50, y: 100 }
 * ```
 */
export function multiplyScalar(a: Circle | CirclePositioned, value: number): Circle | CirclePositioned {
  if (isCirclePositioned(a)) {
    const pt = PointsMultiplyScalar(a, value);
    return Object.freeze({
      ...a,
      ...pt,
      radius: a.radius * value
    });
  } else {
    return Object.freeze({
      ...a,
      radius: a.radius * value
    });
  }
}

