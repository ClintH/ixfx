import {repeat} from "../flow/index.js";
import {GetOrGenerate, getOrGenerate} from "../collections/Map.js";

export type Timestamped<V> = V & {
  readonly at:number
};

export type Opts = {
  readonly storeIntermediate?:boolean
  readonly resetAfterSamples?:number
}

export abstract class TrackerBase<V> {
  seenCount:number;

  protected storeIntermediate:boolean;
  protected resetAfterSamples:number;

  constructor(readonly id:string, opts:Opts = {}) {
    this.storeIntermediate = opts.storeIntermediate ?? false;
    this.resetAfterSamples = opts.resetAfterSamples ?? -1;
    this.seenCount = 0;
  }

  reset() {
    this.seenCount = 0;
    this.onReset();
  }

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  seen(...p:V[]):any {    
    if (this.resetAfterSamples > 0 && this.seenCount > this.resetAfterSamples) {
      this.reset();
    }

    this.seenCount += p.length;
    const t = this.seenImpl(p);
    this.onSeen(t);
  }

  abstract seenImpl(p:V[]):V[];

  abstract get last():V|undefined;
  abstract get initial():V|undefined;

  abstract get elapsed():number;

  //eslint-disable-next-line @typescript-eslint/no-empty-function
  onSeen(_p:V[]) {

  }
  abstract onReset():void;
} 

export class PrimitiveTracker<V extends number|string> extends TrackerBase<V> {
  values:V[];
  timestamps:number[];

  constructor(id:string, opts:Opts) {
    super(id, opts);
    this.values = [];
    this.timestamps = [];
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


/**
 * A tracked value of type `V`.
 */
export class ObjectTracker<V> extends TrackerBase<V> {
  values:Timestamped<V>[];

  constructor(id:string, opts:Opts) {
    super(id, opts);
    this.values = [];
  }

  /**
   * Allows sub-classes to be notified when a reset happens
   */
  onReset() {
    this.values = []; //this.values.slice(1);
  }

  /**
   * Tracks a value
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

  get initial() {
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
    return Date.now() - this.values[0].at;
  }
}

export class TrackedValueMap<V>  {
  store:Map<string, TrackerBase<V>>;
  gog:GetOrGenerate<string, TrackerBase<V>, V>;

  constructor(creator:(key:string, start:V|undefined) => TrackerBase<V>) {
    this.store = new Map();
    this.gog = getOrGenerate<string, TrackerBase<V>, V>(this.store, creator);
  }

  /**
   * Return number of named points being tracked
   */
  get size() {
    return this.store.size;
  }

  /**
   * Returns true if `id` is stored
   * @param id 
   * @returns 
   */
  has(id:string) {
    return this.store.has(id);
  }

  /**
   * For a given id, note that we have seen one or more values.
   * @param id Id
   * @param values Values(s)
   * @returns Information about start to last value
   */
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async seen(id:string, ...values:V[]):Promise<any> {
    const trackedValue = await this.getTrackedValue(id, ...values);
    
    // Pass it over to the TrackedValue
    return trackedValue.seen(...values);
  }

  /**
   * Creates or returns a TrackedValue instance for `id`.
   * @param id 
   * @param values 
   * @returns 
   */
  protected async getTrackedValue(id:string, ...values:V[]) {
    if (id === null) throw new Error(`id parameter cannot be null`);
    if (id === undefined) throw new Error(`id parameter cannot be undefined`);

    // Create or recall TrackedValue by id
    const trackedValue = await this.gog(id, values[0]);
    return trackedValue;
  }

  /**
   * Remove a tracked value by id.
   * Use {@link reset} to clear them all.
   * @param id
   */
  delete(id:string) {
    this.store.delete(id);
  }

  /**
   * Remove all tracked values.
   * Use {@link delete} to remove a single value by id.
   */
  reset() {
    this.store = new Map();
  }

  /**
   * Enumerate ids
   */
  *ids() {
    yield* this.store.keys();
  }

  /**
   * Enumerate tracked values
   */
  *values() {
    yield* this.store.values();
  }

  /**
   * Returns TrackedValues ordered with oldest first
   * @returns 
   */
  trackedByAge():readonly TrackerBase<V>[] {
    const tp = Array.from(this.store.values());
    tp.sort((a, b) => {
      const aa = a.elapsed;
      const bb = b.elapsed;
      if (aa === bb) return 0;
      if (aa > bb) return -1;
      return 1;
    });
    return tp;
  }

  valuesByAge():readonly V[] {
    const tb = this.trackedByAge();
    // @ts-ignore
    return tb.map(t => t.last);
  }

  /**
   * Enumerate last received values
   * 
   * @example Calculate centroid of latest-received values
   * ```js
   * const pointers = pointTracker();
   * const c = Points.centroid(...Array.from(pointers.lastPoints()));
   * ```
   */
  *last() {
    //eslint-disable-next-line functional/no-loop-statement
    for (const p of this.store.values()) {
      yield p.last;
    }
  }

  /**
   * Enumerate starting values
   */
  *initialValues() {
    //eslint-disable-next-line functional/no-loop-statement
    for (const p of this.store.values()) {
      yield p.initial;
    }
  }

  /**
   * Returns a tracked value by id, or undefined if not found
   * @param id 
   * @returns 
   */
  get(id:string):TrackerBase<V>|undefined {
    return this.store.get(id);
  }
}


