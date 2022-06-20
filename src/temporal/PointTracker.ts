import * as Points from "../geometry/Point.js";
import {getOrGenerate, GetOrGenerate} from "../collections/Map.js";
import * as Line from "~/geometry/Line.js";

export type SeenInfo = {
  readonly distance:number
  readonly centroid:Points.Point
  readonly angle:number
  readonly speed:number
};

export type TimestampedPoint = Points.Point & {
  readonly at:number
};

/**
 * A tracked point
 */
export class TrackedPoint {
  relation;
  points:TimestampedPoint[];
  lastPoint:TimestampedPoint;

  constructor(readonly id:string, start:Points.Point, readonly storePoints:boolean) {
    const s = {...start, at:Date.now()};
    this.relation = Points.relation(s);
    this.lastPoint = {...start, at:Date.now()};
    this.points = [s];
  }

  get x() {
    return this.lastPoint.x;
  }

  get y() {
    return this.lastPoint.y;
  }

  /**
   * Returns number of saved points (including start)
   */
  get size() {
    return this.points.length;
  }

  /**
   * Tracks a point, returning information on the relation between it
   * and the start point.
   * 
   * If multiple points are given, it's relation to the last point that is returned.
   * @param p Point
   */
  seen(...p:Points.Point[]|TimestampedPoint[]):SeenInfo {
    // Make sure points have a timestamp
    const ts = p.map(v => ((`at` in v) ? v : {
      ...v,
      at: Date.now()
    }));

    const last = ts[p.length-1];
  
    if (this.storePoints) this.points.push(...ts);
  
    // Get basic geometric relation from start to the last provided point
    const rel = this.relation(last);
    
    const r = {
      ...rel,
      speed: Line.length(last, this.lastPoint) / (last.at - this.lastPoint.at)
    };

    this.lastPoint = last;
    return r;
  }

  /**
   * Returns a polyline representation of stored points.
   * Returns an empty array if points were not saved, or there's only one.
   */
  get line():Line.PolyLine {
    if (this.points.length === 1) return [];
    return Line.joinPointsToLines(...this.points);
  }

  /**
   * Returns the total length of accumulated points.
   * Returns 0 if points were not saved, or there's only one
   */
  get length():number {
    if (this.points.length === 1) return 0;
    const l = this.line;
    return Line.length(l);
  }

  /**
   * Returns the elapsed time, in milliseconds since the instance was created
   */
  get elapsed():number {
    return Date.now() - this.points[0].at;
  }
}

/**
 * Options for PointTracker
 */
export type Opts = {
  /**
   * If true, intermediate points are stored
   */
  readonly trackIntermediatePoints?:boolean
}

export const pointTracker = (opts:Opts):PointTracker => new PointTracker(opts);

/**
 * PointTracker. Mutable.
 */
export class PointTracker  {
  store:Map<string, TrackedPoint>;
  gog:GetOrGenerate<string, TrackedPoint, Points.Point>;

  constructor(opts:Opts = {}) {
    const trackIntermediatePoints = opts.trackIntermediatePoints ?? false;

    this.store = new Map();
    this.gog = getOrGenerate<string, TrackedPoint, Points.Point>(this.store, (key, start) => {
      if (start === undefined) throw new Error(`Requires start point`);
      return new TrackedPoint(key, start, trackIntermediatePoints);
    });
  }

  /**
   * Return number of named points being tracked
   */
  get size() {
    return this.store.size;
  }

  /**
   * For a given id, note that we have seen one or more points.
   * @param id Id
   * @param points Point(s)
   * @returns Information about start to last point
   */
  async seen(id:string, ...points:Points.Point[]) {
    if (id === null) throw new Error(`id parameter cannot be null`);
    if (id === undefined) throw new Error(`id parameter cannot be undefined`);

    // Create or recall TrackedPoint by id
    const trackedPoint = await this.gog(id, points[0]);

    // Pass it over to the TrackedPoint
    return trackedPoint.seen(...points);
  }

  /**
   * Remove a tracked point by id.
   * Use {@link reset} to clear them all.
   * @param id
   */
  delete(id:string) {
    this.store.delete(id);
  }

  /**
   * Remove all tracked points.
   * Use {@link delete} to remove a single point by id.
   */
  reset() {
    this.store = new Map();
  }

  /**
   * Enumerate ids
   */
  *ids() {
    yield* this.store.keys();
  }

  /**
   * Enumerate tracked points
   */
  *trackedPoints() {
    yield* this.store.values();
  }

  /**
   * Returns TrackedPoints ordered with oldest first
   * @returns 
   */
  getTrackedPointsByAge():readonly TrackedPoint[] {
    const tp = Array.from(this.store.values());
    tp.sort((a, b) => {
      const aa =a.elapsed;
      const bb = b.elapsed;
      if (aa === bb) return 0;
      if (aa > bb) return -1;
      return 1;
    });
    return tp;
  }

  /**
   * Enumerate last received points
   * 
   * @example Calculate centroid of latest-received points
   * ```js
   * const c = Points.centroid(...Array.from(pointers.lastPoints()));
   * ```
   */
  *lastPoints() {
    //eslint-disable-next-line functional/no-loop-statement
    for (const p of this.store.values()) {
      yield p.lastPoint;
    }
  }

  /**
   * Enumerate starting points
   */
  *startPoints() {
    //eslint-disable-next-line functional/no-loop-statement
    for (const p of this.store.values()) {
      yield p.points[0];
    }
  }

  /**
   * Returns a tracked point by id, or undefined if not found
   * @param id 
   * @returns 
   */
  get(id:string):TrackedPoint|undefined {
    return this.store.get(id);
  }
  
}