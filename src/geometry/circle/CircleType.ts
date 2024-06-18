import type { Point } from "../point/PointType.js";

/**
 * A circle
 */
export type Circle = {
  readonly radius: number
}

/**
 * A {@link Circle} with position
 */
export type CirclePositioned = Point & Circle;

