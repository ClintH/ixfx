/**
 * Keeps track of the min, max and avg in a stream of values.
 * 
 * Usage:
 * ```
 *  const t = tracker(); 
 *  t.seen(10)
 * 
 *  t.avg / t.min/ t.max / t.getMinMax()
 * ```
 * Use `reset()` to clear everything, or `resetAvg()` to just reset averaging calculation
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
    super();
    if (typeof performance === `undefined`) {
      try {
        const p = require(`perf_hooks`);
        this.perf = p.performance.now;
      } catch (err) {}
    } else {
      this.perf = performance.now;
    }
  }

  mark() {
    if (this.lastMark > 0) {
      this.seen(this.perf() - this.lastMark);
    }
    this.lastMark = this.perf();
  }
}