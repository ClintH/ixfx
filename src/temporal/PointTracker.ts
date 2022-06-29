import * as Points from "../geometry/Point.js";
import * as Line from "~/geometry/Line.js";
import {Timestamped, ObjectTracker, TrackedValueMap, Opts as TrackOpts} from "./TrackedValue.js";

export type PointSeenInfo = {
  readonly distance:number
  readonly centroid:Points.Point
  readonly angle:number
  readonly speed:number
  readonly values:readonly Points.Point[]
  /**
   * Average of all points seen
   */
  readonly average:Points.Point
};

/**
 * A tracked point. Create via {@link pointTracker}. Useful for monitoring how
 * it changes over time. Eg. when a pointerdown event happens, to record the start position and then
 * track the pointer as it moves until pointerup.
 * 
 * ```js
 * // Create a tracker
 * const t = pointTracker(`pointer-0`);
 * 
 * // ...and later, tell it when a point is seen
 * const nfo = t.seen({x: evt.x, y:evt.y});
 * // nfo gives us some details on the relation between the seen point, the start, and points in-between
 * // nfo.angle, nfo.centroid, nfo.speed etc.
 * ```
 * 
 * Compute based on last seen point
 * ```js
 * t.angleFromStart();
 * t.distanceFromStart();
 * t.x / t.y
 * t.length; // Total length of accumulated points
 * t.elapsed; // Total duration since start
 * t.lastInfo; // The {@link PointSeenInfo} for last seen point
 * ```
 * 
 * Housekeeping
 * ```js
 * t.reset(); // Reset tracker
 * ```
 */
export class PointTracker extends ObjectTracker<Points.Point> {
  /**
   * Function that yields the relation from initial point
   */
  relation:Points.PointRelation|undefined;
  
  /**
   * Info on last seen point
   */
  lastInfo:PointSeenInfo|undefined;

  constructor(readonly id:string, opts:TrackOpts) {
    super(id, opts);
  }

  /**
   * Returns the last x coord
   */
  get x() {
    return this.last.x;
  }

  /**
   * Returns the last y coord
   */
  get y() {
    return this.last.y;
  }

  /**
   * @ignore
   */
  onReset(): void {
    super.onReset();
    this.lastInfo = undefined;
    this.relation = undefined;
  }

  /**
   * Tracks a point, returning information on the relation between it
   * and the start point.
   * 
   * If multiple points are given, it's relation to the last point that is returned.
   * @param p Point
   */
  seen(...p:Points.Point[]|Timestamped<Points.Point>[]):PointSeenInfo {
    const currentLast = this.last;
    super.seen(...p);
    const newLast = this.last;

    if (this.relation === undefined) {
      this.relation = Points.relation(newLast);
    }

    // Get basic geometric relation from start to the last provided point
    const rel = this.relation(newLast);
    const r:PointSeenInfo = {
      ...rel,
      values: this.values,
      speed: this.values.length < 2 ? 0 : Line.length(currentLast, newLast) / (newLast.at - currentLast.at),
    };
    this.lastInfo = r;
    return r;
  }

  /**
   * Returns a polyline representation of stored points.
   * Returns an empty array if points were not saved, or there's only one.
   */
  get line():Line.PolyLine {
    if (this.values.length === 1) return [];
    return Line.joinPointsToLines(...this.values);
  }

  /**
   * Returns distance from latest point to initial point.
   * If there are less than two points, zero is returned.
   * @returns Distance
   */
  distanceFromStart():number {
    const initial = this.initial;
    if (this.values.length >= 2 && initial !== undefined) {
      return Points.distance(initial, this.last);
    } else {
      return 0;
    }
  }
  /**
   * Returns angle (in radians) from latest point to the initial point
   * If there are less than two points, undefined is return.
   * @returns Angle in radians
   */
  angleFromStart():number|undefined {
    const initial = this.initial;
    if (initial !== undefined && this.values.length > 2) {
      return Points.angle(initial, this.last);
    }
  }

  /**
   * Returns the total length of accumulated points.
   * Returns 0 if points were not saved, or there's only one
   */
  get length():number {
    if (this.values.length === 1) return 0;
    const l = this.line;
    return Line.length(l);
  }
}


export class TrackedPointMap extends TrackedValueMap<Points.Point> {
  constructor(opts:TrackOpts) {
    super((key, start) => {
      if (start === undefined) throw new Error(`Requires start point`);
      const p = new PointTracker(key, opts);
      p.seen(start);
      return p;
    });
  }

  // async seen(id:string, ...values:Points.Point[]) {
  //   const trackedValue = await this.getTrackedValue(id, ...values) as TrackedPoint;
  //   return trackedValue.seen(...values);
  // }
}

/**
 * Track several named points
 * @param opts 
 * @returns 
 */
export const pointsTracker = (opts:TrackOpts) => new TrackedPointMap(opts);

/**
 * Track a single point.
 * 
 * ```js
 * const t = pointTracker(pointer.id);
 * t.
 * ```
 * @param id 
 * @param opts 
 * @returns {@link PointTracker} instance
 */
export const pointTracker = (id?:string, opts:TrackOpts = {}) => new PointTracker(id ?? ``, opts);