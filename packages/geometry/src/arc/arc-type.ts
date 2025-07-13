import type { Point } from "../point/point-type.js"

/**
 * Arc, defined by radius, start and end point in radians and direction
 */
export type Arc = {
  /**
   * Radius of arc
   */
  readonly radius: number
  /**
   * Start radian
   */
  readonly startRadian: number
  /**
   * End radian
   */
  readonly endRadian: number
  /**
   * If true, arc runs in clockwise direction
   */
  readonly clockwise: boolean
}

/**
 * An {@link Geometry.Arcs.Arc} that also has a center position, given in x, y
 */
export type ArcPositioned = Point & Arc;