import { type TrackedValueOpts } from './TrackedValue.js';

/**
 * Base tracker class
 */
export abstract class TrackerBase<V> {
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

  //eslint-disable-next-line functional/prefer-immutable-types
  seen(...p: V[]) {
    if (this.resetAfterSamples > 0 && this.seenCount > this.resetAfterSamples) {
      this.reset();
    } else if (this.sampleLimit > 0 && this.seenCount > this.sampleLimit * 2) {
      this.seenCount = this.trimStore(this.sampleLimit);
      this.onTrimmed();
    }

    this.seenCount += p.length;
    const t = this.seenImpl(p);
    this.onSeen(t);
  }

  /**
   * @ignore
   * @param p
   */
  //eslint-disable-next-line functional/prefer-immutable-types
  abstract seenImpl(p: V[]): V[];

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
  //eslint-disable-next-line functional/prefer-immutable-types
  onSeen(_p: V[]) {
    /** no-op */
  }

  /**
   * @ignore
   */
  abstract onReset(): void;

  abstract onTrimmed(): void;
  abstract trimStore(limit: number): number;
}
