import type { Point } from "../geometry/point/PointType.js";
import type { PointRelationResult } from "../geometry/point/PointRelationTypes.js";

export type NumberFunction = () => number;

export type ValueType = string | number | boolean | object

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

export type RankArrayOptions = RankOptions & {
  /**
   * If _true_, it's only the highest _within_ an array that is considered,
   * rather than tracking the higest between arrays
   * Default: _false_
   */
  withinArrays?: boolean
}

/**
 * A rank function that compares A and B.
 * Returns the highest value, 'a' or 'b'. 
 * Returns 'eq' if values are equal
 */
export type RankFunction<T> = (a: T, b: T) => `a` | `b` | `eq`

export type RankOptions = {
  /**
   * If set, only values with this JS type are included
   */
  includeType?: `string` | `number` | `object` | `boolean`
  /**
   * If _true_, also emits values when they rank equal with current highest.
   * _false_ by default
   */
  emitEqualRanked?: boolean
  /**
   * If _true_, emits the current highest value even if it hasn't changed.
   * This means it will match the tempo of the incoming stream.
   */
  emitRepeatHighest?: boolean
}