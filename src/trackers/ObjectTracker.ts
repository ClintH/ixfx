import type { TimestampedObject, TrackedValueOpts } from './TrackedValue.js';
import { TrackerBase, type TrimReason } from './TrackerBase.js';

/**
 * A tracked value of type `V`.
 */
export abstract class ObjectTracker<V extends object, SeenResultType> extends TrackerBase<V, SeenResultType> {
  values: Array<TimestampedObject<V>>;

  constructor(opts: TrackedValueOpts = {}) {
    super(opts);
    this.values = [];
  }

  onTrimmed(reason: TrimReason) {
    // no-op
  }

  /**
   * Reduces size of value store to `limit`. 
   * Returns number of remaining items
   * @param limit
   */
  trimStore(limit: number): number {
    if (limit >= this.values.length) return this.values.length;
    // Index 0 will be the oldest
    this.values = this.values.slice(-limit);
    return this.values.length;
  }

  /**
   * Allows sub-classes to be notified when a reset happens
   * @ignore
   */
  onReset() {
    this.values = [];
  }

  /**
   * Tracks a value
   * @ignore
   */
  filterData(p: Array<V> | Array<TimestampedObject<V>>): Array<TimestampedObject<V>> {
    // Make sure values have a timestamp
    const ts = p.map((v) =>
      `at` in v
        ? v
        : {
          ...v,
          at: Date.now(),
        }
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const last = ts.at(-1)!;

    if (this.storeIntermediate) this.values.push(...ts);
    else switch (this.values.length) {
      case 0: {
        // Add as initial value
        this.values.push(last);
        break;
      }
      case 1: {
        // Add last value
        this.values.push(last);
        break;
      }
      case 2: {
        // Replace last value
        this.values[ 1 ] = last;
        break;
      }
    }
    return ts;
  }

  /**
   * Last seen value. If no values have been added, it will return the initial value
   */
  get last() {
    if (this.values.length === 1) return this.values[ 0 ];
    //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.values.at(-1)!;
  }

  /**
   * Returns the oldest value in the buffer
   */
  get initial() {
    return this.values.at(0);
  }

  /**
   * Returns number of recorded values (includes the initial value in the count)
   */
  get size() {
    return this.values.length;
  }

  /**
   * Returns the elapsed time, in milliseconds since the initial value
   */
  get elapsed(): number {
    return Date.now() - this.values[ 0 ].at;
  }

}
