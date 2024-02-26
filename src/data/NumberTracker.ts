import { PrimitiveTracker, type TimestampedPrimitive } from './PrimitiveTracker.js';
import {
  type TrackedValueOpts as TrackOpts,
} from './TrackedValue.js';
import { minFast, maxFast, totalFast } from '../collections/arrays/NumericArrays.js';

export type NumberTrackerResults = {
  readonly total: number
  readonly min: number
  readonly max: number
  readonly avg: number
};

export class NumberTracker extends PrimitiveTracker<number, NumberTrackerResults> {
  total = 0;
  min = Number.MAX_SAFE_INTEGER;
  max = Number.MIN_SAFE_INTEGER;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(opts?: TrackOpts) {
    super(opts);
    /** no-op */
  }

  get avg() {
    return this.total / this.seenCount;
  }

  /**
   * Difference between last value and initial.
   * Eg. if last value was 10 and initial value was 5, 5 is returned (10 - 5)
   * If either of those is missing, undefined is returned
   */
  difference(): number | undefined {
    if (this.last === undefined) return;
    if (this.initial === undefined) return;
    return this.last - this.initial;
  }

  /**
   * Relative difference between last value and initial.
   * Eg if last value was 10 and initial value was 5, 2 is returned (200%)
   */
  relativeDifference(): number | undefined {
    if (this.last === undefined) return;
    if (this.initial === undefined) return;
    return this.last / this.initial;
  }

  onReset() {
    this.min = Number.MAX_SAFE_INTEGER;
    this.max = Number.MIN_SAFE_INTEGER;
    this.total = 0;
    super.onReset();
  }

  onTrimmed() {
    this.min = minFast(this.values);
    this.max = maxFast(this.values);
    this.total = totalFast(this.values);
  }

  computeResults(values: Array<TimestampedPrimitive<number>>): NumberTrackerResults {
    if (values.some((v) => Number.isNaN(v))) throw new Error(`Cannot add NaN`);
    const numbers = values.map(value => value.value);

    this.total = numbers.reduce((accumulator, v) => accumulator + v, this.total);
    this.min = Math.min(...numbers, this.min);
    this.max = Math.max(...numbers, this.max);
    const r: NumberTrackerResults = {
      max: this.max,
      min: this.min,
      total: this.total,
      avg: this.avg
    }
    return r;
  }

  getMinMaxAvg() {
    return {
      min: this.min,
      max: this.max,
      avg: this.avg,
    };
  }
}

/**
 * Keeps track of the total, min, max and avg in a stream of values. By default values
 * are not stored.
 *
 * Usage:
 *
 * ```js
 * import { numberTracker } from 'https://unpkg.com/ixfx/dist/data.js';
 *
 * const t = numberTracker();
 * t.seen(10);
 *
 * t.avg / t.min/ t.max
 * t.initial; // initial value
 * t.size;    // number of seen values
 * t.elapsed; // milliseconds since intialisation
 * t.last;    // last value
 * ```
 *
 * To get `{ avg, min, max, total }`
 * ```
 * t.getMinMax()
 * ```
 *
 * Use `t.reset()` to clear everything.
 *
 * Trackers can automatically reset after a given number of samples
 * ```
 * // reset after 100 samples
 * const t = numberTracker({ resetAfterSamples: 100 });
 * ```
 *
 * To store values, use the `storeIntermediate` option:
 *
 * ```js
 * const t = numberTracker({ storeIntermediate: true });
 * ```
 *
 * Difference between last value and initial value:
 * ```js
 * t.relativeDifference();
 * ```
 *
 * Get raw data (if it is being stored):
 * ```js
 * t.values; // array of numbers
 * t.timestampes; // array of millisecond times, indexes correspond to t.values
 * ```
 * @class NumberTracker
 */
export const numberTracker = (opts: TrackOpts = {}) => new NumberTracker(opts);
