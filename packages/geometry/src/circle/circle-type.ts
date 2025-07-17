import type { Point } from "../point/point-type.js";

/**
 * A circle
 */
export type Circle = {
  readonly radius: number
}

export type CircleToSvg = {
  (circleOrRadius: Circle | number, sweep: boolean, origin: Point): readonly string[];
  (circle: CirclePositioned, sweep: boolean): readonly string[];
};
/**
 * A {@link Circle} with position
 */
export type CirclePositioned = Point & Circle;

export type CircleRandomPointOpts = {
  /**
   * Algorithm to calculate random values.
   * Default: 'uniform'
   */
  readonly strategy: `naive` | `uniform`
  /**
   * Random number source.
   * Default: Math.random
   */
  readonly randomSource: () => number
  /**
   * Margin within shape to start generating random points
   * Default: 0
   */
  readonly margin: number
}
