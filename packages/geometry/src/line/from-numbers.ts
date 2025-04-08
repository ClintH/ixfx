import { fromPoints } from "./from-points.js";
import type { Line } from "./line-type.js";

/**
 * Returns a line from a basis of coordinates (x1, y1, x2, y2)
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * // Line from 0,1 -> 10,15
 * Lines.fromNumbers(0, 1, 10, 15);
 * ```
 * @param x1 
 * @param y1 
 * @param x2 
 * @param y2 
 * @returns 
 */
export const fromNumbers = (x1: number, y1: number, x2: number, y2: number): Line => {
  if (Number.isNaN(x1)) throw new Error(`x1 is NaN`);
  if (Number.isNaN(x2)) throw new Error(`x2 is NaN`);
  if (Number.isNaN(y1)) throw new Error(`y1 is NaN`);
  if (Number.isNaN(y2)) throw new Error(`y2 is NaN`);

  const a = { x: x1, y: y1 };
  const b = { x: x2, y: y2 };
  return fromPoints(a, b);
};