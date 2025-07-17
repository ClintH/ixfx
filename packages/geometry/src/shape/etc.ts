import type { RandomSource } from "@ixfx/random";
import type { ShapePositioned } from "./shape-type.js";
import { isCircle, isCirclePositioned } from "../circle/guard.js";
import { isRect, isRectPositioned } from "../rect/guard.js";
import { randomPoint as circleRandomPoint } from '../circle/random.js';
import { randomPoint as rectRandomPoint } from '../rect/random.js';
import type { Point } from "../point/point-type.js";
import type { Rect } from "../rect/rect-types.js";
import type { Triangle } from "../triangle/triangle-type.js";
import type { Circle } from "../circle/circle-type.js";
import { center as circleCenter } from '../circle/center.js';
import { isTriangle } from "../triangle/guard.js";
import { centroid as triangleCentroid } from "../triangle/centroid.js";
import { center as rectCenter } from '../rect/center.js';

export type ShapeRandomPointOpts = {
  readonly randomSource: RandomSource;
};

/**
 * Returns a random point within a shape.
 * `shape` can be {@link Circles.CirclePositioned} or {@link Rects.RectPositioned}
 * @param shape 
 * @param opts 
 * @returns 
 */
export const randomPoint = (
  shape: ShapePositioned,
  opts: Partial<ShapeRandomPointOpts> = {}
): Point => {
  if (isCirclePositioned(shape)) {
    return circleRandomPoint(shape, opts);
  } else if (isRectPositioned(shape)) {
    return rectRandomPoint(shape, opts);
  }
  throw new Error(`Unknown shape. Only CirclePositioned and RectPositioned are supported.`);
};

// export type Shape = {
//   intersects(x:Point|Shape):ContainsResult
//   readonly kind:`circular`

// }

/**
 * Returns the center of a shape
 * Shape can be: rectangle, triangle, circle
 * @param shape
 * @returns
 */
export const center = (
  shape?: Rect | Triangle | Circle
): Point => {
  if (shape === undefined) {
    return Object.freeze({ x: 0.5, y: 0.5 });
  } else if (isRect(shape)) {
    return rectCenter(shape);
  } else if (isTriangle(shape)) {
    return triangleCentroid(shape);
  } else if (isCircle(shape)) {
    return circleCenter(shape);
  } else {
    throw new Error(`Unknown shape: ${ JSON.stringify(shape) }`);
  }
};
