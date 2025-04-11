import type { Interval } from "@ixfxfun/core";
import { type Timeout, timeout } from "@ixfxfun/flow";

export type RateTrackerOpts = Readonly<{
  /**
 * If above zero, tracker will reset after this many samples
 */
  resetAfterSamples?: number;

  /**
   * If set, tracker will reset after this much time
   * since last `mark()` call.
   */
  timeoutInterval?: Interval
  /**
   * If above zero, there will be a limit to intermediate values kept.
   *
   * When the seen values is twice `sampleLimit`, the stored values will be trimmed down
   * to `sampleLimit`. We only do this when the values are double the size so that
   * the collections do not need to be trimmed repeatedly whilst we are at the limit.
   *
   * Automatically implies storeIntermediate
   */
  sampleLimit?: number;
}>

/**
 * Tracks the rate of events.
 * It's also able to compute the min,max and average interval between events.
 * 
 * @example
 * ```js
 * const clicks = Trackers.rate();
 * 
 * // Mark when a click happens
 * document.addEventListener(`click`, () => clicks.mark());
 * 
 * // Get details
 * clicks.perSecond; // How many clicks per second
 * clicks.perMinute; // How many clicks per minute
 * ```
 * 
 * `timeoutInterval` is a useful option to make the tracker reset
 * after some period without `mark()` being called.
 * 
 * Another useful option is `sampleLimit`, which sets an upper bound
 * for how many events to track. A smaller value means the results
 * will more accurately track, but it might be less smooth.
 * 
 * ```js
 * // Eg reset tracker after 5 seconds of inactivity
 * const clicks = Trackers.rate({ 
 *  sampleLimit: 10,
 *  timeoutInterval: { secs: 5 }
 * });
 * ```
 */
export class RateTracker {
  #events: number[] = []
  #fromTime;
  #resetAfterSamples;
  #sampleLimit;
  #resetTimer: Timeout | undefined;

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
  mark() {
    if (this.#events.length >= this.#resetAfterSamples) {
      this.reset();
    } else if (this.#events.length >= this.#sampleLimit) {
      this.#events = this.#events.slice(1);
      this.#fromTime = this.#events[ 0 ];
    }
    this.#events.push(performance.now());
    if (this.#resetTimer) {
      this.#resetTimer.start();
    }
  }

  /**
   * Compute {min,max,avg} for the interval _between_ events.
   * @returns 
   */
  computeIntervals() {
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
    const avg = total / count;
    return {
      min, max, avg
    }
  }

  /**
   * Returns the time period (in milliseconds) that encompasses
   * the data set. Eg, a result of 1000 means there's data that
   * covers a one second period.
   */
  get elapsed() {
    return performance.now() - this.#fromTime;
  }

  /**
   * Resets the tracker.
   */
  reset() {
    this.#events = [];
    this.#fromTime = performance.now();
  }

  /**
   * Get the number of events per second
   */
  get perSecond() {
    return this.#events.length / (this.elapsed / 1000)
  }

  /**
   * Get the number of events per minute
   */
  get perMinute() {
    return this.#events.length / (this.elapsed / 1000 / 60)
  }
}

/**
 * @inheritdoc RateTracker
 * @param opts 
 * @returns 
 */
export const rate = (opts: Partial<RateTrackerOpts> = {}) => new RateTracker(opts);
