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
 * An {@link Arc} that also has a center position, given in x, y
 */
export type ArcPositioned = Point & Arc;

/**
 * Function which can interpolate along an {@link Arc} or {@link ArcPositioned}.
 */
export type ArcInterpolate = {
  (amount: number, arc: Arc, allowOverflow: boolean, origin: Point): Point;
  (amount: number, arc: ArcPositioned, allowOverflow?: boolean): Point;
};

/**
 * Function to convert an arc to SVG segments
 */
export type ArcToSvg = {
  /**
   * SVG path for arc description
   * @param origin Origin of arc
   * @param radius Radius
   * @param startRadian Start
   * @param endRadian End
   */
  (origin: Point, radius: number, startRadian: number, endRadian: number, opts?: ArcSvgOpts): readonly string[];
  /**
   * SVG path for non-positioned arc.
   * If `arc` does have a position, `origin` will override it.
   */
  (arc: Arc, origin: Point, opts?: ArcSvgOpts): readonly string[];
  /**
   * SVG path for positioned arc
   */
  (arc: ArcPositioned, opts?: ArcSvgOpts): readonly string[];
};

export type ArcSvgOpts = {

  /**
   * "If the arc should be greater or less than 180 degrees"
   * ie. tries to maximise arc length
   */
  readonly largeArc?: boolean

  /**
   * "If the arc should begin moving at positive angles"
   * ie. the kind of bend it makes to reach end point
   */
  readonly sweep?: boolean
}