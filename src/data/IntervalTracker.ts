import {NumberTracker} from "./NumberTracker.js";
import {TrackedValueOpts as TrackOpts} from "./TrackedValue.js";

/**
 * A `Tracker` that tracks interval between calls to `mark()`
 *
 * @export
 * @class IntervalTracker
 * @extends {ValueTracker}
 */
export class IntervalTracker extends NumberTracker {
  lastMark = 0;

  mark() {
    if (this.lastMark > 0) {
      this.seen(window.performance.now() - this.lastMark);
    }
    this.lastMark = window.performance.now();
  }
}

/**
 * Returns a new {@link IntervalTracker} instance. IntervalTracker
 * records the interval between each call to `mark`.
 * 
 * ```js
 * import { intervalTracker } from 'https://unpkg.com/ixfx/dist/data.js';
 * 
 * const t = intervalTracker();
 * 
 * // Call `mark` to record an interval
 * t.mark();
 * ...
 * t.mark();
 * 
 * // Get average time in milliseconds between calls to `mark`
 * t.avg;
 * 
 * // Longest and shortest times are available too...
 * t.min / t.max
 * ```
 * 
 * Interval tracker can automatically reset after a given number of samples:
 * 
 * ```
 * // Reset after 100 samples
 * const t = intervalTracker(`tracker`, { resetAfterSamples: 100} );
 * ```
 * @param id Optional id of instance
 * @returns New interval tracker
 */
export const intervalTracker = (id?:string, opts?:TrackOpts) => new IntervalTracker(id, opts);