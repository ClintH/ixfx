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

  constructor(opts: TrackedValueOpts = {}) {
    this.id = opts.id ?? `tracker`;
    this.sampleLimit = opts.sampleLimit ?? -1;
    this.resetAfterSamples = opts.resetAfterSamples ?? -1;

    this.storeIntermediate =
      opts.storeIntermediate ??
      (this.sampleLimit > -1 || this.resetAfterSamples > -1);
    this.seenCount = 0;
  }

  /**
   * Reset tracker
   */
  reset() {
    this.seenCount = 0;
    this.onReset();
  }

  /**
   * Calculate results
   *  
   * @param p 
   * @returns 
   */
  seen(...p: Array<V>): SeenResultType {
    if (this.resetAfterSamples > 0 && this.seenCount > this.resetAfterSamples) {
      this.reset();
    } else if (this.sampleLimit > 0 && this.seenCount > this.sampleLimit * 2) {
      this.seenCount = this.trimStore(this.sampleLimit);
      this.onTrimmed();
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

  abstract onTrimmed(): void;
  abstract trimStore(limit: number): number;
}
