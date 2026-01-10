import type { Timestamped, TrackedValueOpts, TrimReason } from './types.js';

/**
 * Base tracker class
 */
export abstract class TrackerBase<V, SeenResultType> {
  /**
   * @ignore
   */
  seenCount: number;

  /**
   * @ignore
   */
  protected storeIntermediate: boolean;

  /**
   * @ignore
   */
  protected resetAfterSamples: number;

  /**
   * @ignore
   */
  protected sampleLimit: number;

  public readonly id: string;

  protected debug: boolean;

  constructor(opts: TrackedValueOpts = {}) {
    this.id = opts.id ?? `tracker`;
    this.debug = opts.debug ?? false;
    this.sampleLimit = opts.sampleLimit ?? -1;
    this.resetAfterSamples = opts.resetAfterSamples ?? -1;

    this.storeIntermediate =
      opts.storeIntermediate ??
      (this.sampleLimit > -1 || this.resetAfterSamples > -1);
    this.seenCount = 0;

    if (this.debug) {
      console.log(`TrackerBase: sampleLimit: ${ this.sampleLimit } resetAfter: ${ this.resetAfterSamples } store: ${ this.storeIntermediate }`);
    }
  }

  /**
   * Reset tracker
   */
  reset(): void {
    this.seenCount = 0;
    this.onReset();
  }

  /**
   * Adds a value, returning computed result.
   *  
   * At this point, we check if the buffer is larger than `resetAfterSamples`. If so, `reset()` is called.
   * If not, we check `sampleLimit`. If the buffer is twice as large as sample limit, `trimStore()` is
   * called to take it down to sample limit, and `onTrimmed()` is called.
   * @param p 
   * @returns 
   */
  seen(...p: V[]): SeenResultType {
    if (this.resetAfterSamples > 0 && this.seenCount > this.resetAfterSamples) {
      this.reset();
    } else if (this.sampleLimit > 0 && this.seenCount > this.sampleLimit * 2) {
      this.seenCount = this.trimStore(this.sampleLimit);
      this.onTrimmed(`resize`);
    }

    this.seenCount += p.length;
    const t = this.filterData(p);
    return this.computeResults(t);
  }

  /**
   * @ignore
   * @param p
   */
  abstract filterData(p: V[]): Timestamped[];

  abstract get last(): V | undefined;

  /**
   * Returns the initial value, or undefined
   */
  abstract get initial(): V | undefined;

  /**
   * Returns the elapsed milliseconds since the initial value
   */
  abstract get elapsed(): number;

  /**
   * Returns the millisecond period from the oldest and newest value.
   * Returns NaN if there's no initial/last values
   */
  abstract get timespan(): number;
  /**
   * @ignore
   */

  abstract computeResults(_p: Timestamped[]): SeenResultType;

  /**
   * @ignore
   */
  abstract onReset(): void;


  /**
   * Notification that buffer has been trimmed
   */
  abstract onTrimmed(reason: TrimReason): void;
  abstract trimStore(limit: number): number;
}


