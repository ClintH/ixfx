import * as Points from '../geometry/point/index.js';
import {
  TrackedValueMap,
  type TrackedValueOpts as TrackOpts,
  type TimestampedObject,
} from './TrackedValue.js';
import { ObjectTracker } from './ObjectTracker.js';
import { length as LineLength } from '../geometry/line/Length.js';
import { Vectors } from '../geometry/index.js';
import { Empty as LinesEmpty } from 'src/geometry/line/index.js';
import type { Coord as PolarCoord } from '../geometry/Polar.js';
import type { Line, PolyLine } from '../geometry/line/LineType.js';
import type { Point } from '../geometry/point/PointType.js';
import type { PointRelation, PointRelationResult } from '../geometry/point/PointRelation.js';
import { joinPointsToLines } from '../geometry/line/JoinPointsToLines.js';

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

/**
 * Point tracker. Create via `pointTracker()`.
 *
 */
export class PointTracker extends ObjectTracker<Point, PointTrackerResults> {
  /**
   * Function that yields the relation from initial point
   */
  initialRelation: PointRelation | undefined;

  /**
   * Last result
   */
  lastResult: PointTrackerResults | undefined;

  constructor(opts: TrackOpts = {}) {
    super(opts);
  }

  onTrimmed(): void {
    // Force new relation calculations
    this.initialRelation = undefined;
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

  seenEvent(p: PointerEvent): PointTrackerResults {
    if (`getCoalescedEvents` in p) {
      const events = p.getCoalescedEvents();
      const asPoints = events.map(event => ({ x: event.clientX, y: event.clientY }));
      return this.seen(...asPoints);
    } else {
      // @ts-expect-error
      return this.seen({ x: p.clientX, y: p.clientY });
    }
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
    _p: Array<TimestampedObject<Point>>
  ): PointTrackerResults {
    const currentLast = this.last;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const previousLast = this.values.at(-2);

    if (this.initialRelation === undefined && this.initial) {
      // Don't yet have an initial relation function
      this.initialRelation = Points.relation(this.initial);
    } else if (this.initialRelation === undefined) {
      // Don't have an initial relation, but also don't have an initial point :()
      throw new Error(`Bug: No initialRelation, and this.inital is undefined?`);
    }

    // Make a new relator based on previous point
    const lastRelation = previousLast === undefined ? Points.relation(currentLast) : Points.relation(previousLast);

    // Compute relation from initial point to latest
    const initialRel: PointTrack = this.initialRelation(currentLast);

    const speed = previousLast === undefined ? 0 : LineLength(previousLast, currentLast) / (currentLast.at - previousLast.at);

    // Compute relation from current point to the previous
    const lastRel: PointTrack = {
      ...lastRelation(currentLast),
      speed,
    };

    const r: PointTrackerResults = {
      fromInitial: initialRel,
      fromLast: lastRel,
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
    return this.values.length >= 2 && initial !== undefined ? Points.distance(initial, this.last) : 0;
  }

  /**
   * Difference between last point and the initial point, calculated
   * as a simple subtraction of x & y.
   *
   * `Points.Placeholder` is returned if there's only one point so far.
   */
  difference(): Point {
    const initial = this.initial;
    return this.values.length >= 2 && initial !== undefined ? Points.subtract(this.last, initial) : Points.Placeholder;
  }

  /**
   * Returns angle (in radians) from latest point to the initial point
   * If there are less than two points, undefined is return.
   * @returns Angle in radians
   */
  angleFromStart(): number | undefined {
    const initial = this.initial;
    if (initial !== undefined && this.values.length > 2) {
      return Points.angle(initial, this.last);
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
}

/**
 * A {@link TrackedValueMap} for points. Uses {@link PointTracker} to
 * track added values.
 */
export class TrackedPointMap extends TrackedValueMap<
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

  /**
   * Track a PointerEvent
   * @param event
   */
  seenEvent(event: PointerEvent): Promise<Array<PointTrackerResults>> {
    if (`getCoalescedEvents` in event) {
      const events = event.getCoalescedEvents();
      const seens = events.map(subEvent => super.seen(subEvent.pointerId.toString(), subEvent));
      return Promise.all(seens);
    } else {
      return Promise.all([ super.seen((event as PointerEvent).pointerId.toString(), event) ]);
    }
  }
}

/**
 * Track several named points over time, eg a TensorFlow body pose point.
 * Call `seen()` to track a point. Mutable. If you want to compare
 * a single coordinate with a reference coordinate,  may be a better choice.
 *
 * See also:
 * * [Geometry.Points.relation](Geometry.Points.relation.html): Compute relation info between two points
 * * [Data.pointTracker](Data.pointTracker-1.html): Track relation between points over time
 * * [Guide to Trackers](https://clinth.github.io/ixfx-docs/data/trackers/)
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
 * pt.size;       // How many named points are being tracked
 * pt.delete(id); // Delete named point
 * pt.reset();    // Clear data
 * ```
 *
 * Accessing by id:
 *
 * ```js
 * pt.get(id);  // Get named point (or _undefined_)
 * pt.has(id);  // Returns true if id exists
 * ```
 *
 * Iterating over data
 *
 * ```js
 * pt.trackedByAge(); // Iterates over tracked points, sorted by age (oldest first)
 * pt.tracked(); // Tracked values
 * pt.ids();     // Iterator over ids
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
 * * `id`: Id of this tracker. Optional
 * * `sampleLimit`: How many samples to store
 * * `storeIntermediate`: If _true_, all points are stored internally
 * * `resetAfterSamples`: If set above 0, it will automatically reset after the given number of samples have been seen
 * @param opts
 * @returns
 */
export const pointsTracker = (opts: TrackOpts = {}) =>
  new TrackedPointMap(opts);

/**
 * A tracked point. Create via {@link pointTracker}. Mutable. Useful for monitoring how
 * it changes over time. Eg. when a pointerdown event happens, to record the start position and then
 * track the pointer as it moves until pointerup.
 *
 * See also
 * * [Playground](https://clinth.github.io/ixfx-play/data/point-tracker/index.html)
 * * {@link pointsTracker}: Track several points, useful for multi-touch.
 * * [Guide to Trackers](https://clinth.github.io/ixfx-docs/data/trackers/)
 * 
 * ```js
 * import { pointTracker } from 'https://unpkg.com/ixfx/dist/data.js';
 *
 * // Create a tracker on a pointerdown
 * const t = pointTracker();
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
 * const t = pointTracker({
 *  sampleLimit: 10
 * });
 *
 * // Store all 'seen' points
 * const t = pointTracker({
 *  storeIntermediate: true
 * });
 *
 * // In this case, the whole tracker is automatically
 * // reset after 10 samples
 * const t = pointTracker({
 *  resetAfterSamples: 10
 * })
 * ```
 *
 * When using a buffer limited by `sampleLimit`, the 'initial' point will be the oldest in the
 * buffer, not actually the very first point seen.
 */
export const pointTracker = (opts: TrackOpts = {}) => new PointTracker(opts);
