import type { Point } from "../point/PointType.js"

/**
 * Arc, defined by radius, start and end point in radians, and whether it is counter-clockwise.
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
   * If true, arc is counter-clockwise
   */
  readonly counterClockwise?: boolean
}

/**
 * An {@link Geometry.Arcs.Arc} that also has a position, given in x, y
 */
export type ArcPositioned = Point & Arc;