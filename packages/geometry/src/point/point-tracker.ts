import {
  TrackedValueMap,
  type TrackedValueOpts as TrackOpts,
  type TimestampedObject,
} from '@ixfx/trackers';
import { ObjectTracker } from '@ixfx/trackers';
import { length as LineLength } from '../line/length.js';
import * as Vectors from '../vector.js';
import { Empty as LinesEmpty } from '../line/index.js';
import type { Coord as PolarCoord } from '../polar/index.js';
import type { Line, PolyLine } from '../line/line-type.js';
import type { Point, Point3d } from './point-type.js';
import type { PointRelation } from './point-relation-types.js';
import { joinPointsToLines } from '../line/join-points-to-lines.js';
import type { TrimReason } from '@ixfx/trackers';
import type { PointRelationResult } from "./point-relation-types.js";
import { relation } from './relation.js';
import { distance } from './distance.js';
import { subtract } from './subtract.js';
import { angleRadian } from './angle.js';
import { Placeholder as PointsPlaceholder } from './point-type.js';
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
  values: readonly Point[];
}>;



/**
 * A tracked point. Mutable. Useful for monitoring how
 * it changes over time. Eg. when a pointerdown event happens, to record the start position and then
 * track the pointer as it moves until pointerup.
 *
 * See also
 * * [Playground](https://clinth.github.io/ixfx-play/data/point-tracker/index.html)
 * * {@link PointsTracker}: Track several points, useful for multi-touch.
 * * [ixfx Guide to Point Tracker](https://ixfx.fun/geometry/tracking/)
 * 
 * ```js
 * // Create a tracker on a pointerdown
 * const t = new PointTracker();
 *
 * // ...and later, tell it when a point is seen (eg. pointermove)
 * const nfo = t.seen({x: evt.x, y:evt.y});
 * // nfo gives us some details on the relation between the seen point, the start, and points inbetween
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
 * t.lastResult; // The PointSeenInfo for last seen point
 * ```
 *
 * Housekeeping
 * ```js
 * t.reset(); // Reset tracker
 * ```
 *
 * By default, the tracker only keeps track of the initial point and
 * does not store intermediate 'seen' points. To use the tracker as a buffer,
 * set `storeIntermediate` option to _true_.
 *
 * ```js
 * // Keep only the last 10 points
 * const t = new PointTracker({
 *  sampleLimit: 10
 * });
 *
 * // Store all 'seen' points
 * const t = new PointTracker({
 *  storeIntermediate: true
 * });
 *
 * // In this case, the whole tracker is automatically
 * // reset after 10 samples
 * const t = new PointTracker({
 *  resetAfterSamples: 10
 * })
 * ```
 *
 * When using a buffer limited by `sampleLimit`, the 'initial' point will be the oldest in the
 * buffer, not actually the very first point seen.
 */
export class PointTracker extends ObjectTracker<Point, PointTrackerResults> {
  initialRelation: PointRelation | undefined;
  markRelation: PointRelation | undefined;
  lastResult: PointTrackerResults | undefined;

  constructor(opts: TrackOpts = {}) {
    super(opts);
  }

  /**
   * Notification that buffer has been knocked down to `sampleLimit`.
   * 
   * This will reset the `initialRelation`, which will use the new oldest value.
   */
  onTrimmed(_reason: TrimReason): void {
    // Force new relation calculations
    this.initialRelation = undefined;
  }

  /**
   * @ignore
   */
  onReset(): void {
    super.onReset();
    this.lastResult = undefined;
    this.initialRelation = undefined;
    this.markRelation = undefined
  }

  /**
   * Adds a PointerEvent along with its
   * coalesced events, if available.
   * @param p 
   * @returns 
   */
  seenEvent(p: PointerEvent | MouseEvent): PointTrackerResults {
    if (`getCoalescedEvents` in p) {
      const events = p.getCoalescedEvents();
      const asPoints = events.map(event => ({ x: event.clientX, y: event.clientY }));
      return this.seen(...asPoints);
    } else {
      return this.seen({ x: (p).clientX, y: (p).clientY });
    }
  }

  /**
   * Makes a 'mark' in the tracker, allowing you to compare values
   * to this point.
   */
  mark() {
    this.markRelation = relation(this.last);
  }

  /**
   * Tracks a point, returning data on its relation to the
   * initial point and the last received point.
   * 
   * Use {@link seenEvent} to track a raw `PointerEvent`.
   * 
   * @param _p Point
   */
  computeResults(
    _p: TimestampedObject<Point>[]
  ): PointTrackerResults {
    const currentLast = this.last;
    const previousLast = this.values.at(-2);

    if (this.initialRelation === undefined && this.initial) {
      // Don't yet have an initial relation function
      // Use the oldest point in the buffer (this.initial)
      this.initialRelation = relation(this.initial);
    } else if (this.initialRelation === undefined) {
      // Don't have an initial relation, but also don't have an initial point :()
      throw new Error(`Bug: No initialRelation, and this.inital is undefined?`);
    }

    // Make a new relator based on previous point
    const lastRelation = previousLast === undefined ? relation(currentLast) : relation(previousLast);

    // Compute relation from initial point to latest
    const initialRel: PointTrack = this.initialRelation(currentLast);

    const markRel: PointTrack | undefined = (this.markRelation !== undefined) ? this.markRelation(currentLast) : undefined;

    const speed = previousLast === undefined ? 0 : LineLength(previousLast, currentLast) / (currentLast.at - previousLast.at);

    // Compute relation from current point to the previous
    const lastRel: PointTrack = {
      ...lastRelation(currentLast),
      speed,
    };

    const r: PointTrackerResults = {
      fromInitial: initialRel,
      fromLast: lastRel,
      fromMark: markRel,
      values: [ ...this.values ],
    };
    this.lastResult = r;
    return r;
  }

  /**
   * Returns a polyline representation of stored points.
   * Returns an empty array if points were not saved, or there's only one.
   */
  get line(): PolyLine {
    if (this.values.length === 1) return [];
    return joinPointsToLines(...this.values);
  }

  /**
   * Returns a vector of the initial/last points of the tracker.
   * Returns as a polar coordinate
   */
  get vectorPolar(): PolarCoord {
    return Vectors.fromLinePolar(this.lineStartEnd);
  }

  /**
   * Returns a vector of the initial/last points of the tracker.
   * Returns as a Cartesian coordinate
   */
  get vectorCartesian(): Point {
    return Vectors.fromLineCartesian(this.lineStartEnd);
  }

  /**
   * Returns a line from initial point to last point.
   *
   * If there are less than two points, Lines.Empty is returned
   */
  get lineStartEnd(): Line {
    const initial = this.initial;
    if (this.values.length < 2 || !initial) return LinesEmpty;
    return {
      a: initial,
      b: this.last,
    };
  }

  /**
   * Returns distance from latest point to initial point.
   * If there are less than two points, zero is returned.
   *
   * This is the direct distance from initial to last,
   * not the accumulated length.
   * @returns Distance
   */
  distanceFromStart(): number {
    const initial = this.initial;
    return this.values.length >= 2 && initial !== undefined ? distance(initial, this.last) : 0;
  }

  /**
   * Returns the elapsed time since current 'initial' point.
   * Returns NaN if there's no initial point
   * @returns 
   */
  elapsedFromStart(): number {
    const initial = this.initial;
    if (!initial) return Number.NaN;
    return Date.now() - initial.at;
  }

  /**
   * Returns the speed (over milliseconds), calculated by distanceFromStart/elapsedFromStart.
   * 
   * If there's no initial point, 0 is returned.
   * @returns 
   */
  speedFromStart(): number {
    const d = this.distanceFromStart();
    const t = this.elapsedFromStart();
    if (Number.isNaN(t)) return 0;
    if (d === 0) return 0;
    return Math.abs(d) / t;
  }

  /**
   * Difference between last point and the initial point, calculated
   * as a simple subtraction of x,y & z.
   *
   * `Points.Placeholder` is returned if there's only one point so far.
   */
  difference(): Point | Point3d {
    const initial = this.initial;
    return this.values.length >= 2 && initial !== undefined ? subtract(this.last, initial) : PointsPlaceholder;
  }

  /**
   * Returns angle (in radians) from latest point to the initial point
   * If there are less than two points, undefined is return.
   * @returns Angle in radians
   */
  angleFromStart(): number | undefined {
    const initial = this.initial;
    if (initial !== undefined && this.values.length > 2) {
      return angleRadian(initial, this.last);
    }
  }

  /**
   * Returns the total length of accumulated points.
   * Returns 0 if points were not saved, or there's only one
   */
  get length(): number {
    if (this.values.length === 1) return 0;
    const l = this.line;
    return LineLength(l);
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
   * Returns the last z coord (or _undefined_ if not available)
   */
  get z() {
    return this.last.z;
  }
}

/**
 * A {@link TrackedValueMap} for points. Uses {@link PointTracker} to
 * track added values.
 */
export class PointsTracker extends TrackedValueMap<
  Point,
  PointTracker,
  PointTrackerResults
> {

  constructor(opts: TrackOpts = {}) {
    super((key, start) => {
      if (start === undefined) throw new Error(`Requires start point`);
      const p = new PointTracker({
        ...opts,
        id: key,
      });
      p.seen(start);
      return p;
    });
  }

  get(id: string) {
    const v = super.get(id);
    return v as PointTracker | undefined
  }

  /**
   * Track a PointerEvent
   * @param event
   */
  seenEvent(event: PointerEvent): Promise<PointTrackerResults[]> {
    if (`getCoalescedEvents` in event) {
      const events = event.getCoalescedEvents();
      const seens = events.map(subEvent => super.seen(subEvent.pointerId.toString(), subEvent));
      return Promise.all(seens);
    } else {

      return Promise.all([ super.seen((event as PointerEvent).pointerId.toString(), event) ]);
    }
  }
}
