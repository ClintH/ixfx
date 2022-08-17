import {Timestamped, TrackedValueOpts} from "./TrackedValue";
import {TrackerBase} from "./TrackerBase";

/**
 * A tracked value of type `V`.
 */
export class ObjectTracker<V> extends TrackerBase<V> {
  values:Timestamped<V>[];

  constructor(id:string, opts:TrackedValueOpts = {}) {
    super(id, opts);
    this.values = [];
  }

  /**
   * Allows sub-classes to be notified when a reset happens
   * @ignore
   */
  onReset() {
    this.values = []; //this.values.slice(1);
  }

  /**
   * Tracks a value
   * @ignore
   */
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  seenImpl(p:V[]|Timestamped<V>[]):Timestamped<V>[] {
    // Make sure values have a timestamp
    const ts = p.map(v => ((`at` in v) ? v : {
      ...v,
      at: Date.now()
    }));

    const last = ts.at(-1) as Timestamped<V>;
  
    if (this.storeIntermediate) this.values.push(...ts);
    else if (this.values.length === 0) {
      // Add as initial value
      this.values.push(last);
    }
    else if (this.values.length === 2) {
      // Replace last value
      this.values[1] = last;
    } else if (this.values.length === 1) {
      // Add last value
      this.values.push(last);
    }

    return ts;
  }

  /**
   * Last seen value. If no values have been added, it will return the initial value
   */
  get last() {
    if (this.values.length === 1) return this.values[0];
    //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.values.at(-1)!;
  }

  /**
   * Returns the initial value
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
  get elapsed():number {
    return Date.now() - this.values[0].at;
  }
}
