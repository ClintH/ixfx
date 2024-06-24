import type { Point } from "../point/PointType.js";
import type { CirclePositioned } from "./CircleType.js";
import { pointOnPerimeter } from "./Perimeter.js";
const piPi = Math.PI * 2;
/**
 * Computes relative position along circle perimeter
 * 
 * ```js
 * import { Circles } from "https://unpkg.com/ixfx/dist/geometry.js" 
 * const circle = { radius: 100, x: 100, y: 100 };
 * 
 * // Get a point halfway around circle
 * // Yields { x, y }
 * const pt = Circles.interpolate(circle, 0.5);
 * ```
 * @param circle 
 * @param t Position, 0-1
 * @returns 
 */
export const interpolate = (circle: CirclePositioned, t: number): Point => pointOnPerimeter(circle, t * piPi);
