import { type RectPositioned } from "./RectTypes.js";

import type { Point } from "../point/PointType.js";
import { guard as PointsGuard } from '../point/Guard.js';
import { guardDim } from "./Guard.js";
/**
 * Initialises a rectangle based on its center, a width and height
 *
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 *
 * // Rectangle with center at 50,50, width 100 height 200
 * Rects.fromCenter({x: 50, y:50}, 100, 200);
 * ```
 * @param origin
 * @param width
 * @param height
 * @returns
 */
export const fromCenter = (
  origin: Point,
  width: number,
  height: number
): RectPositioned => {
  PointsGuard(origin, `origin`);

  guardDim(width, `width`);
  guardDim(height, `height`);

  const halfW = width / 2;
  const halfH = height / 2;
  return {
    x: origin.x - halfW,
    y: origin.y - halfH,
    width: width,
    height: height,
  };
};