import type { Interval } from "@ixfx/core";
import type { Timeout } from "@ixfx/flow";
import { timeout } from "@ixfx/flow";

/**
 * Options for a {@link RateTracker}
 */
export type RateTrackerOpts = Readonly<{
  /**
   * If above zero, tracker will reset after this many samples.
   *
   * Since all intermediate values are wiped, it works best when the data source
   * is relatively consistent, or initially-reported analysis will be quite off.
   *
   * Alternatively, use {@link sampleLimit} to only keep the last _n_ number
   * of samples
   */
  resetAfterSamples?: number;

  /**
   * If set, tracker will reset after this much time
   * since last `mark()` call.
   *
   * Like {@link resetAfterSamples}, since this wipes all the prior values, it works
   * best when the data source is relatively consistent, otherwise it can
   * take some samples before it reflects the true range.
   */
  timeoutInterval?: Interval;
  /**
   * If above zero, there will be a limit to intermediate values kept.
   *
   * This way the calculations only use the most recent _n_ number of samples.
   *
   * Alternatively use {@link resetAfterSamples} to wipe all the intermediate values,
   * starting from scratch or {@link timeoutInterval} which works similarly, but based
   * on a timeout.
   *
   * When the seen values is twice `sampleLimit`, the stored values will be trimmed down
   * to `sampleLimit`. We only do this when the values are double the size so that
   * the collections do not need to be trimmed repeatedly whilst we are at the limit.
   *
   * Automatically implies `storeIntermediate`.
   */
  sampleLimit?: number;
}>;

/**
 * Tracks the rate of events: eg, how many times an event happens per second.
 *
 * It's also able to compute the min, max and average interval between events.
 *
 * @example
 * ```js
 * // Initialise it once
 * const clicks = Trackers.rate(); // or: const clicks = new Trackers.RateTracker();
 *
 * // Mark when a click happens
 * document.addEventListener(`click`, () => clicks.mark());
 *
 * // Compute rate (returned as a number)
 * clicks.perSecond; // How many clicks per second
 * clicks.perMinute; // How many clicks per minute
 * ```
 *
 * By default the tracker keeps averaging over _all_ the data it sees.
 * It can be useful to limit it so more accurately tracks changes in frequency.
 *
 * To do so, pass in options when creating it:
 *
 * ```js
 * // Eg reset tracker after 5 seconds of inactivity,
 * // and only keep up to 10 samples max.
 * const clicks = Trackers.rate({
 *  sampleLimit: 10,
 *  timeoutInterval: { secs: 5 }
 * });
 * ```
 *
 * - `timeoutInterval` is a makes the tracker reset
 * after some period without `mark()` being called.
 * - `sampleLimit` sets an upper bound
 * for how many of the most recent events should we consider.
 * A smaller value means the analysis will be more responsive to
 * changes in data source, at the cost of jitter. A larger value
 * gets a smoother response, at the cost of responsiveness.
 *
 * The way it works under-the-hood is we store the timestamp each time `mark()`
 * is called, and use this as the basis for computation.
 */
export class RateTracker {
  #events: number[] = [];
  #fromTime;
  #resetAfterSamples;
  #sampleLimit;
  #resetTimer: Timeout | undefined;

  /**
   * Creates a new rate tracker.
   *
   * By default it does not reset.
   * @param opts Options
   */
  constructor(opts: Partial<RateTrackerOpts> = {}) {
    this.#resetAfterSamples = opts.resetAfterSamples ?? Number.MAX_SAFE_INTEGER;
    this.#sampleLimit = opts.sampleLimit ?? Number.MAX_SAFE_INTEGER;
    if (opts.timeoutInterval) {
      this.#resetTimer = timeout(() => {
        this.reset();
      }, opts.timeoutInterval);
    }
    this.#fromTime = performance.now();
  }

  /**
   * Mark that an event has happened
   */
  mark(): void {
    if (this.#events.length >= this.#resetAfterSamples) {
      this.reset();
    } else if (this.#events.length >= this.#sampleLimit) {
      this.#events = this.#events.slice(1);
      this.#fromTime = this.#events[0];
    }
    this.#events.push(performance.now());
    if (this.#resetTimer) {
      this.#resetTimer.start();
    }
  }

  /**
   * Computes the average time _between_ events, as well
   * as the longest and shortest time seen.
   *
   * @returns Analysis in the form of `{ min, max, avg }`
   */
  computeIntervals(): {
    min: number;
    max: number;
    avg: number;
  } {
    const intervals: number[] = [];
    let min = Number.MAX_SAFE_INTEGER;
    let max = Number.MIN_SAFE_INTEGER;
    let total = 0;
    let count = 0;
    let start = 0;
    for (const event of this.#events) {
      if (count > 0) {
        const index = event - start;
        min = Math.min(index, min);
        max = Math.max(index, max);
        total += index;
        intervals.push(index);
      }
      start = event;
      count++;
    }
    const avg = intervals.length > 0 ? total / intervals.length : 0;
    return {
      min,
      max,
      avg,
    };
  }

  /**
   * Returns the time period (in milliseconds) that encompasses
   * the data set. Eg, a result of 1000 means there's data that
   * covers a one second period.
   */
  get elapsed(): number {
    return performance.now() - this.#fromTime;
  }

  /**
   * Resets the tracker's stored values.
   */
  reset(): void {
    this.#events = [];
    this.#fromTime = performance.now();
  }

  /**
   * Computes the rate of events in terms of events/second
   */
  get perSecond(): number {
    return this.#events.length / (this.elapsed / 1000);
  }

  /**
   * Computes the rate of events in terms of events/minute
   */
  get perMinute(): number {
    return this.#events.length / (this.elapsed / 1000 / 60);
  }
}

/**
 * @inheritdoc
 * @param opts
 * @returns
 */
export const rate = (opts: Partial<RateTrackerOpts> = {}): RateTracker => new RateTracker(opts);
