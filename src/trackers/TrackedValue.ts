import { type GetOrGenerate, getOrGenerate } from '../data/maps/GetOrGenerate.js';
import { TrackerBase } from './TrackerBase.js';

export type Timestamped = {
  readonly at: number
}
export type TimestampedObject<V> = V & Timestamped;

/**
 * Options
 */
export type TrackedValueOpts = {
  readonly id?: string;

  /**
   * If true, intermediate points are stored. False by default
   */
  readonly storeIntermediate?: boolean;
  /**
   * If above zero, tracker will reset after this many samples
   */
  readonly resetAfterSamples?: number;

  /**
   * If above zero, there will be a limit to intermediate values kept.
   *
   * When the seen values is twice `sampleLimit`, the stored values will be trimmed down
   * to `sampleLimit`. We only do this when the values are double the size so that
   * the collections do not need to be trimmed repeatedly whilst we are at the limit.
   *
   * Automatically implies storeIntermediate
   */
  readonly sampleLimit?: number;

  /**
   * If _true_, prints debug info
   */
  readonly debug?: boolean
};

/**
 * Keeps track of keyed values of type `V` (eg Point). It stores occurences in type `T`, which
 * must extend from `TrackerBase<V>`, eg `PointTracker`.
 *
 * The `creator` function passed in to the constructor is responsible for instantiating
 * the appropriate `TrackerBase` sub-class.
 *
 * @example Sub-class
 * ```js
 * export class TrackedPointMap extends TrackedValueMap<Points.Point> {
 *  constructor(opts:TrackOpts = {}) {
 *   super((key, start) => {
 *    if (start === undefined) throw new Error(`Requires start point`);
 *    const p = new PointTracker(key, opts);
 *    p.seen(start);
 *    return p;
 *   });
 *  }
 * }
 * ```
 *
 */
export class TrackedValueMap<V, T extends TrackerBase<V, TResult>, TResult> {
  store: Map<string, T>;
  gog: GetOrGenerate<string, T, V>;

  constructor(creator: (key: string, start: V | undefined) => T) {
    this.store = new Map();
    this.gog = getOrGenerate<string, T, V>(this.store, creator);
  }

  /**
   * Number of named values being tracked
   */
  get size() {
    return this.store.size;
  }

  /**
   * Returns _true_ if `id` is stored
   * @param id
   * @returns
   */
  has(id: string) {
    return this.store.has(id);
  }

  /**
   * For a given id, note that we have seen one or more values.
   * @param id Id
   * @param values Values(s)
   * @returns Information about start to last value
   */
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  //eslint-disable-next-line functional/prefer-immutable-types
  public async seen(id: string, ...values: Array<V>): Promise<TResult> {
    const trackedValue = await this.getTrackedValue(id, ...values);

    // Pass it over to the TrackedValue
    const result = trackedValue.seen(...values);

    return result;
  }

  /**
   * Creates or returns a TrackedValue instance for `id`.
   * @param id
   * @param values
   * @returns
   */
  //eslint-disable-next-line functional/prefer-immutable-types
  protected async getTrackedValue(id: string, ...values: Array<V>) {
    if (id === null) throw new Error(`id parameter cannot be null`);
    if (id === undefined) throw new Error(`id parameter cannot be undefined`);

    // Create or recall TrackedValue by id
    const trackedValue = await this.gog(id, values[ 0 ]);
    return trackedValue;
  }

  /**
   * Remove a tracked value by id.
   * Use {@link reset} to clear them all.
   * @param id
   */
  delete(id: string) {
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
  *tracked() {
    yield* this.store.values();
  }

  /**
   * Iterates TrackedValues ordered with oldest first
   * @returns
   */
  *trackedByAge() {
    const tp = [ ...this.store.values() ];
    tp.sort((a, b) => {
      const aa = a.elapsed;
      const bb = b.elapsed;
      if (aa === bb) return 0;
      if (aa > bb) return -1;
      return 1;
    });

    for (const t of tp) {
      yield t;
    }
  }

  /**
   * Iterates underlying values, ordered by age (oldest first)
   * First the named values are sorted by their `elapsed` value, and then
   * we return the last value for that group.
   */
  *valuesByAge() {
    for (const tb of this.trackedByAge()) {
      yield tb.last;
    }
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
    for (const p of this.store.values()) {
      yield p.last;
    }
  }

  /**
   * Enumerate starting values
   */
  *initialValues() {
    for (const p of this.store.values()) {
      yield p.initial;
    }
  }

  /**
   * Returns a tracked value by id, or undefined if not found
   * @param id
   * @returns
   */
  get(id: string): TrackerBase<V, TResult> | undefined {
    return this.store.get(id);
  }
}
