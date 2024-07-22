import type { Point } from "../geometry/point/PointType.js";
import type { PointRelationResult } from "../geometry/point/PointRelationTypes.js";

/**
 * Information about seen points
 */
export type PointTrack = PointRelationResult & {
  // readonly speedFromInitial:number
};

/**
 * Results of point tracking
 */
export type PointTrackerResults = {
  /**
   * Relation of last point to previous point
   */
  readonly fromLast: PointTrack;
  /**
   * Relation of last point to initial point.
   * 
   * When the tracker is reset or resizes (eg. if it reaches its capacity), the
   * initial point will be the first new point. Thus, the initial point
   * always maintains some time horizon
   */
  readonly fromInitial: PointTrack;
  readonly values: ReadonlyArray<Point>;
};
