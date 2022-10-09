import { repeat } from "../flow/index.js";
import { TrackedValueOpts, Timestamped } from "./TrackedValue.js";
import { TrackerBase } from "./TrackerBase.js";

export class PrimitiveTracker<V extends number|string> extends TrackerBase<V> {
  values:V[];
  timestamps:number[];

  constructor(id?:string, opts?:TrackedValueOpts) {
    super(id, opts);
    this.values = [];
    this.timestamps = [];
  }

  /**
   * Reduces size of value store to `limit`. Returns
   * number of remaining items
   * @param limit 
   */
  trimStore(limit:number):number {
    if (limit >= this.values.length) return this.values.length;
    this.values = this.values.slice(-limit);
    this.timestamps = this.timestamps.slice(-limit);
    return this.values.length;
  }

  onTrimmed() {
    // no-op
  }
  
    
  get last():V|undefined {
    return this.values.at(-1);
  }

  get initial():V|undefined {
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
  get elapsed():number {
    if (this.values.length < 0) throw new Error(`No values seen yet`);
    return Date.now() - this.timestamps[0];
  }

  onReset() {
    this.values = [];
    this.timestamps = [];
  }

  /**
   * Tracks a value
   */
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  seenImpl(p:V[]):V[] {
    const last = p.at(-1) as Timestamped<V>;
    const now = Date.now();
    if (this.storeIntermediate) {
      this.values.push(...p);
      this.timestamps.push(...repeat(p.length, () => now));
    } else if (this.values.length === 0) {
      // Add as initial value
      this.values.push(last);
      this.timestamps.push(now);
    }
    else if (this.values.length === 2) {
      // Replace last value
      this.values[1] = last;
      this.timestamps[1] = now;
    } else if (this.values.length === 1) {
      // Add last value
      this.values.push(last);
      this.timestamps.push(now);
    }

    return p;
  }

}
