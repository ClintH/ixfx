import type { TrackedValueOpts } from './types.js';
import { NumberTracker } from './number-tracker.js';

/**
 * A `Tracker` that tracks interval between calls to `mark()`
 */
export class IntervalTracker extends NumberTracker {
  lastMark = 0;

  mark() {
    if (this.lastMark > 0) {
      this.seen(performance.now() - this.lastMark);
    }
    this.lastMark = performance.now();
  }
}

/**
 * Returns a new {@link IntervalTracker} instance. IntervalTracker
 * records the interval between each call to `mark`.
 *
 * ```js
 * import { interval } from '@ixfx/trackers.js';
 *
 * const t = interval();
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
 * const t = interval({ resetAfterSamples: 100} );
 * ```
 * @param options Options for tracker
 * @returns New interval tracker
 */
export const interval = (options?: TrackedValueOpts) => new IntervalTracker(options);
