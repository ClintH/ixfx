import { type Timestamped, type TrackedValueOpts } from './TrackedValue.js';

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
  reset() {
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
  seen(...p: Array<V>): SeenResultType {
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
  abstract filterData(p: Array<V>): Array<Timestamped>;

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
   * @ignore
   */
  //eslint-disable-next-line @typescript-eslint/no-empty-function
  abstract computeResults(_p: Array<Timestamped>): SeenResultType;

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

export type TrimReason = `reset` | `resize`
