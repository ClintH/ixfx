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
 * A tracked point
 */
export class PointTracker extends ObjectTracker<Points.Point> {
  relation:Points.PointRelation|undefined;
  lastInfo:PointSeenInfo|undefined;

  constructor(readonly id:string, readonly opts:TrackOpts) {
    super(id, opts);
  }

  get x() {
    return this.last.x;
  }

  get y() {
    return this.last.y;
  }

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
 * Track a single point
 * @param id 
 * @param opts 
 * @returns 
 */
export const pointTracker = (id?:string, opts:TrackOpts = {}) => new PointTracker(id ?? ``, opts);