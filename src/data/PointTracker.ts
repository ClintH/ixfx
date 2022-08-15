import * as Points from "../geometry/Point.js";
import * as Line from "../geometry/Line.js";
import {Timestamped, ObjectTracker, TrackedValueMap, TrackedValueOpts as TrackOpts} from "./TrackedValue.js";

/**
 * Information about seen points
 */
export type PointTrack = Points.PointRelationResult & {
  /**
   * Distance
   */
  //readonly distance:number
  /**
   * Centroid
   */
  //readonly centroid:Points.Point
  //readonly angle:number

  /**
   * Units/millisecond
   */
  readonly speed:number
  /**
   * Average of all points seen
   */
  //readonly average:Points.Point
};

export type PointTrackerResults = {
  readonly fromLast: PointTrack
  readonly fromInitial: PointTrack
  readonly values:readonly Points.Point[]
}

export class PointTracker extends ObjectTracker<Points.Point> {
  /**
   * Function that yields the relation from initial point
   */
  initialRelation:Points.PointRelation|undefined;
  
  /**
   * Last result
   */
  lastResult:PointTrackerResults|undefined;

  constructor(readonly id:string, opts:TrackOpts = {}) {
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
    this.lastResult = undefined;
    this.initialRelation = undefined;
  }

  /**
   * Tracks a point, returning data on its relation to the
   * initial point and the last received point.
   * @param p Point
   */
  seen(...p:Points.Point[]|Timestamped<Points.Point>[]):PointTrackerResults {
    const currentLast = this.last;
    super.seen(...p);
    const newLast = this.last;
  
    // Don't yet have an initial relation function
    if (this.initialRelation === undefined && this.initial) {
      this.initialRelation = Points.relation(this.initial);
    } else if (this.initialRelation === undefined) {
      throw new Error(`Bug: No initialRelation, and this.inital is undefined?`);
    }

    const lastRelation = Points.relation(currentLast);

    // Get basic geometric relation from start to the last provided point
    const initialRel:PointTrack = {
      ...this.initialRelation(newLast),
      speed: this.values.length < 2 ? 0 : Line.length(this.initial!, newLast) / (newLast.at - this.initial!.at),
    };
    const lastRel:PointTrack = {
      ...lastRelation(newLast),
      speed: this.values.length < 2 ? 0 : Line.length(currentLast, newLast) / (newLast.at - currentLast.at),
    };
    
    const r:PointTrackerResults = {
      fromInitial: initialRel,
      fromLast: lastRel,
      values: [...this.values]
    };
    this.lastResult = r;
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
   * 
   * This is the direct distance, not the accumulated length.
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
   * Difference between last point and the initial point, calculated
   * as a simple subtraction of x & y.
   * 
   * `Points.Placeholder` is returned if there's only one point so far.
   */
  difference():Points.Point {
    const initial = this.initial;
    if (this.values.length >= 2 && initial !== undefined) {
      return Points.subtract(this.last, initial);
    } else {
      return Points.Placeholder;
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
  constructor(opts:TrackOpts = {}) {
    super((key, start) => {
      if (start === undefined) throw new Error(`Requires start point`);
      const p = new PointTracker(key, opts);
      p.seen(start);
      return p;
    });
  }
}

/**
 * Track several named points. Call `seen()` to track a point. Mutable.
 * 
 * Basic usage
 * ```js
 * import { pointsTracker } from 'https://unpkg.com/ixfx/dist/data.js';
 * 
 * const pt = pointsTracker();
 * 
 * // Track a point under a given id
 * document.addEventListener(`pointermove`, e => {
 *  const info = await pt.seen(e.pointerId, { x: e.x, y: e.y });
 *  // Yields some info on relation of the point to initial value
 * });
 * ```
 * 
 * Do something with last values for all points
 * ```js
 * const c = Points.centroid(...Array.from(pt.last()));
 * ```
 * 
 * More functions...
 * ```js
 * pt.size; // How many named points are being tracked
 * pt.delete(id);  // Delete named point
 * pt.reset();
 * ```
 * 
 * Accessing data:
 * 
 * ```js
 * pt.get(id);  // Get named point (or _undefined_)
 * pt.has(id); // Returns true if id exists
 * pt.trackedByAge(); // Iterates over tracked points, sorted by age (oldest first)
 * 
 * ```
 
* Iterators:
 * 
 * ```js
 * pt.tracked(); // Tracked values
 * pt.ids(); // Iterator over ids
 * 
 * // Last received value for each named point
 * pt.last(); 
 * 
 * pt.initialValues(); // Iterator over initial values for each point
 * ```
 * 
 * You can work with 'most recently updated' points:
 * 
 * ```js
 * // Iterates over points, sorted by age (oldest first)
 * pt.valuesByAge(); 
 * ```
 * 
 * Options:
 * * `storeIntermediate`: if true, all points are stored internally
 * * `resetAfterSamples`: If set above 0, it will automatically reset after the given number of samples have been seen
 * @param opts 
 * @returns 
 */
export const pointsTracker = (opts:TrackOpts = {}) => new TrackedPointMap(opts);

/**
 * A tracked point. Create via {@link pointTracker}. Mutable. Useful for monitoring how
 * it changes over time. Eg. when a pointerdown event happens, to record the start position and then
 * track the pointer as it moves until pointerup.
 * 
 * [See the point tracker playground](https://clinth.github.io/ixfx-demos/playgrounds/data/point-tracker/)
 * 
 * ```js
* import { pointTracker } from 'https://unpkg.com/ixfx/dist/data.js';
 * 
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
 * t.lastInfo; // The PointSeenInfo for last seen point
 * ```
 * 
 * Housekeeping
 * ```js
 * t.reset(); // Reset tracker
 * ```
 */
export const pointTracker = (id?:string, opts:TrackOpts = {}) => new PointTracker(id ?? ``, opts);