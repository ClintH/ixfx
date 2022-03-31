/**
 * Keeps track of the min, max and avg in a stream of values without actually storing them.
 * 
 * Usage:
 * 
 * ```js
 *  const t = tracker(); 
 *  t.seen(10);
 * 
 *  t.avg / t.min/ t.max / t.getMinMax()
 * ```
 * 
 * Use `reset()` to clear everything, or `resetAvg()` to only reset averaging calculation
 * @class Tracker
 */
export class Tracker {
  samples = 0;
  total = 0;
  min = 0;
  max = 0;
  id: string | undefined;

  constructor(id: string | undefined = undefined) {
    this.id = id;
  }

  get avg() { return this.total / this.samples; }

  resetAvg(newId: string | null = null) {
    if (newId !== null) this.id = newId;
    this.total = 0;
    this.samples = 0;
  }

  reset(newId: string | null = null) {
    this.min = Number.MAX_SAFE_INTEGER;
    this.max = Number.MIN_SAFE_INTEGER;
    this.resetAvg(newId);
  }

  seen(sample: number) {
    if (Number.isNaN(sample)) throw Error(`Cannot add NaN`);
    this.samples++;
    this.total += sample;
    this.min = Math.min(sample, this.min);
    this.max = Math.max(sample, this.max);
  }

  getMinMaxAvg() {
    return {
      min: this.min,
      max: this.max,
      avg: this.avg,
    };
  }
}

export const tracker = (id?:string) => new Tracker(id);

/**
 * A `Tracker` that tracks interval between calls to `mark()`
 *
 * @export
 * @class IntervalTracker
 * @extends {Tracker}
 */
export class IntervalTracker extends Tracker {
  lastMark = 0;
  perf;
  constructor(id: string | undefined = undefined) {
    super(id);
    if (typeof performance === `undefined`) {
      try {
        //eslint-disable-next-line @typescript-eslint/no-var-requires
        const p = require(`perf_hooks`);
        this.perf = p.performance.now;
      } catch (err) {
        // no-op
      }
    } else {
      this.perf = window.performance.now;
    }
  }

  mark() {
    if (this.lastMark > 0) {
      this.seen(this.perf() - this.lastMark);
    }
    this.lastMark = this.perf();
  }
}

/**
 * Returns a new {@link IntervalTracker} instance. IntervalTracker
 * records the interval between each call to `mark`.
 * 
 * ```js
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
 * t.min; t.max
 * ```
 * @param id Optional id of instance
 * @returns New interval tracker
 */
export const intervalTracker = (id?:string) => new IntervalTracker(id);