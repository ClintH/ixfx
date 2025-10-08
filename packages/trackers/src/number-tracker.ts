import { PrimitiveTracker } from "./primitive-tracker.js";
import type { TimestampedPrimitive, TrackedValueOpts, TrimReason } from './types.js';
import { minFast, maxFast, totalFast } from "@ixfx/numbers";

export type NumberTrackerResults = {
  readonly total: number
  readonly min: number
  readonly max: number
  readonly avg: number
};

export class NumberTracker extends PrimitiveTracker<number, NumberTrackerResults> {
  #total = 0;
  #min = Number.MAX_SAFE_INTEGER;
  #max = Number.MIN_SAFE_INTEGER;



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
    this.#min = Number.MAX_SAFE_INTEGER;
    this.#max = Number.MIN_SAFE_INTEGER;
    this.#total = 0;
    super.onReset();
  }

  /**
   * When trimmed, recomputes to set total/min/max to be based on
   * current values.
   * @param reason 
   */
  onTrimmed(reason: TrimReason) {
    this.#min = minFast(this.values);
    this.#max = maxFast(this.values);
    this.#total = totalFast(this.values);
  }

  computeResults(values: TimestampedPrimitive<number>[]): NumberTrackerResults {
    if (values.some((v) => Number.isNaN(v))) throw new Error(`Cannot add NaN`);
    const numbers = values.map(value => value.value);

    this.#total = numbers.reduce((accumulator, v) => accumulator + v, this.#total);
    this.#min = Math.min(...numbers, this.#min);
    this.#max = Math.max(...numbers, this.#max);
    return {
      max: this.#max,
      min: this.#min,
      total: this.#total,
      avg: this.avg
    };
  }

  getMinMaxAvg() {
    return {
      min: this.#min,
      max: this.#max,
      avg: this.avg,
    };
  }

  get max() {
    return this.#max;
  }

  get total() {
    return this.#total;
  }

  get min() {
    return this.#min;
  }

  get avg() {
    return this.#total / this.seenCount;
  }
}

/**
 * Keeps track of the total, min, max and avg in a stream of values. By default values
 * are not stored.
 *
 * Usage:
 *
 * ```js
 * import { number } from '@ixfx/trackers.js';
 *
 * const t = number();
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
 * const t = number({ resetAfterSamples: 100 });
 * ```
 *
 * To store values, use the `storeIntermediate` option:
 *
 * ```js
 * const t = number({ storeIntermediate: true });
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
 */
export const number = (opts: TrackedValueOpts = {}) => new NumberTracker(opts);
