//import { repeat } from '../flow/index.js';

import type { TrackedValueOpts } from './TrackedValue.js';
import { TrackerBase, type TrimReason } from './TrackerBase.js';

export type TimestampedPrimitive<V extends number | string> = {
  at: number
  value: V
}

export abstract class PrimitiveTracker<
  V extends number | string,
  TResult
> extends TrackerBase<V, TResult> {
  values: Array<V>;
  timestamps: Array<number>;

  constructor(opts?: TrackedValueOpts) {
    super(opts);
    this.values = [];
    this.timestamps = [];
  }

  /**
   * Reduces size of value store to `limit`. Returns
   * number of remaining items
   * @param limit
   */
  trimStore(limit: number): number {
    if (limit >= this.values.length) return this.values.length;
    this.values = this.values.slice(-limit);
    this.timestamps = this.timestamps.slice(-limit);
    return this.values.length;
  }

  onTrimmed(reason: TrimReason) {
    // no-op
  }

  get last(): V | undefined {
    return this.values.at(-1);
  }

  get initial(): V | undefined {
    return this.values.at(0);
  }

  /**
   * Returns number of recorded values (this can include the initial value)
   */
  get size() {
    return this.values.length;
  }

  /**
   * Returns the elapsed time, in milliseconds since the instance was created
   */
  get elapsed(): number {
    if (this.values.length < 0) throw new Error(`No values seen yet`);
    return Date.now() - this.timestamps[ 0 ];
  }

  onReset() {
    this.values = [];
    this.timestamps = [];
  }

  /**
   * Tracks a value
   */
  filterData(rawValues: Array<V>): Array<TimestampedPrimitive<V>> {
    const lastValue = rawValues.at(-1);
    const last: TimestampedPrimitive<V> = { value: lastValue as unknown as V, at: performance.now() };

    const values: Array<TimestampedPrimitive<V>> = rawValues.map(value => ({
      at: performance.now(),
      value: value
    }));

    //const now = Date.now();
    if (this.storeIntermediate) {
      this.values.push(...rawValues);
      this.timestamps.push(...values.map(v => v.at));
    } else switch (this.values.length) {
      case 0: {
        // Add as initial value
        this.values.push(last.value);
        this.timestamps.push(last.at);
        break;
      }
      case 2: {
        // Replace last value
        this.values[ 1 ] = last.value;
        this.timestamps[ 1 ] = last.at;
        break;
      }
      case 1: {
        // Add last value
        this.values.push(last.value);
        this.timestamps.push(last.at);
        break;
      }
      // No default
    }

    return values;
  }
}
