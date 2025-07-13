import type { Point } from "../point/point-type.js";
import { guardDim } from "./guard.js";
import type { RectPositioned } from "./rect-types.js";
import { guard as PointsGuard } from '../point/guard.js';

/**
 * Creates a rectangle from its top-left coordinate, a width and height.
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * // Rectangle at 50,50 with width of 100, height of 200.
 * const rect = Rects.fromTopLeft({ x: 50, y:50 }, 100, 200);
 * ```
 * @param origin
 * @param width
 * @param height
 * @returns
 */
export const fromTopLeft = (
  origin: Point,
  width: number,
  height: number
): RectPositioned => {
  guardDim(width, `width`);
  guardDim(height, `height`);
  PointsGuard(origin, `origin`);

  return { x: origin.x, y: origin.y, width: width, height: height };
};
