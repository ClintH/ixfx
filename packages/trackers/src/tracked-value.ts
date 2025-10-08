import { type GetOrGenerate, getOrGenerate, getOrGenerateSync, type GetOrGenerateSync } from '@ixfx/core/maps';
import { TrackerBase } from './tracker-base.js';


/**
 * Keeps track of keyed values of type `V` (eg Point). It stores occurences in type `T`, which
 * must extend from `TrackerBase<V>`, eg `PointTracker`.
 *
 * The `creator` function passed in to the constructor is responsible for instantiating
 * the appropriate `TrackerBase` sub-class.
 *
 * @example Sub-class
 * ```js
 * export class PointsTracker extends TrackedValueMap<Points.Point> {
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
  gog: GetOrGenerateSync<string, T, V>;

  constructor(creator: (key: string, start: V | undefined) => T) {
    this.store = new Map();
    this.gog = getOrGenerateSync<string, T, V>(this.store, creator);
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

  public seen(id: string, ...values: V[]): TResult {
    const trackedValue = this.getTrackedValue(id, ...values);

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
  protected getTrackedValue(id: string, ...values: V[]) {
    if (id === null) throw new Error(`id parameter cannot be null`);
    if (id === undefined) throw new Error(`id parameter cannot be undefined`);

    // Create or recall TrackedValue by id
    const trackedValue = this.gog(id, values[ 0 ]);
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
