import {PrimitiveTracker} from "./PrimitiveTracker.js";
import { TrackedValueOpts as TrackOpts, Timestamped} from "./TrackedValue.js";


export class NumberTracker extends PrimitiveTracker<number> {
  //samples = 0;
  total = 0;
  min = Number.MAX_SAFE_INTEGER;
  max = Number.MIN_SAFE_INTEGER;

  get avg() { 
    return this.total / this.seenCount;
  }

  // resetAvg(newId: string | null = null) {
  //   if (newId !== null) this.id = newId;
  //   this.total = 0;
  //   this.samples = 0;
  // }


  /**
   * Difference between last value and initial.
   * Eg. if last value was 10 and initial value was 5, 5 is returned (10 - 5)
   * If either of those is missing, undefined is returned
   */
  difference():number|undefined {
    if (this.last === undefined) return;
    if (this.initial === undefined) return;
    return this.last - this.initial;
  }

  /**
   * Relative difference between last value and initial.
   * Eg if last value was 10 and initial value was 5, 2 is returned (200%)
   */
  relativeDifference():number|undefined {
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

  onSeen(values:Timestamped<number>[]) {
    if (values.some(v => Number.isNaN(v))) throw Error(`Cannot add NaN`);
    this.total = values.reduce((acc, v) => acc+v, this.total);
    this.min = Math.min(...values, this.min);
    this.max = Math.max(...values, this.max);
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
 * const t = numberTracker(`something`, { resetAfterSamples: 100 });
 * ```
 * 
 * To store values, use the `storeIntermediate` option:
 * 
 * ```js
 * const t = numberTracker(`something`, { storeIntermediate: true });
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
export const numberTracker = (id?:string, opts?:TrackOpts) => new NumberTracker(id ?? ``, opts ?? {});

