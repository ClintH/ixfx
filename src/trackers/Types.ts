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
export type PointTrackerResults = Readonly<{
  /**
   * Relation of last point to previous point
   */
  fromLast: PointTrack;
  /**
   * Relation of last point to 'initial' point.
   * This will be the oldest point in the buffer of the tracker.
   */
  fromInitial: PointTrack;
  /**
   * Relation of last point to a 'mark' point,
   * which is manually set.
   * 
   * Will give _undefined_ if `.mark()` has not been called on tracker.
   */
  fromMark: PointTrack | undefined;
  values: ReadonlyArray<Point>;
}>;
