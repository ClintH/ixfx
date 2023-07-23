import { SimpleEventEmitter } from '../../Events.js';
import { sortByValueProperty } from './MapFns.js';
import { integer as guardInteger } from '../../Guards.js';

/**
 * Expiring map options
 */
export type Opts = {
  /**
   * Capacity limit
   */
  readonly capacity?: number;
  /**
   * Policy for evicting items if capacity is reached
   */
  readonly evictPolicy?: `none` | `oldestGet` | `oldestSet`;
  /**
   * Automatic deletion policy.
   * none: no automatic deletion (default)
   * get/set: interval based on last get/set
   * either: if either interval has elapsed
   */
  readonly autoDeletePolicy?: `none` | `get` | `set` | `either`;
  /**
   * Automatic deletion interval
   */
  readonly autoDeleteElapsedMs?: number;
};

type Item<V> = {
  readonly value: V;
  readonly lastSet: number;
  readonly lastGet: number;
};

/**
 * Event from the ExpiringMap
 */
export type ExpiringMapEvent<K, V> = {
  readonly key: K;
  readonly value: V;
};

export type ExpiringMapEvents<K, V> = {
  /**
   * Fires when an item is removed due to eviction
   * or automatic expiry
   */
  readonly expired: ExpiringMapEvent<K, V>;
  /**
   * Fires when a item with a new key is added
   */
  readonly newKey: ExpiringMapEvent<K, V>;

  /**
   * Fires when an item is manually removed,
   * removed due to eviction or automatic expiry
   */
  readonly removed: ExpiringMapEvent<K, V>;
};

/**
 * Create a ExpiringMap instance
 * @param opts
 * @returns
 */
export const create = <K, V>(opts: Opts = {}): ExpiringMap<K, V> =>
  new ExpiringMap(opts);
/***
 * A map that can have a capacity limit. The elapsed time for each get/set
 * operation is maintained allowing for items to be automatically removed.
 * `has()` does not affect the last access time.
 *
 * By default, it uses the `none` eviction policy, meaning that when full
 * an error will be thrown if attempting to add new keys.
 *
 * Eviction policies:
 * `oldestGet` removes the item that hasn't been accessed the longest,
 * `oldestSet` removes the item that hasn't been updated the longest.
 *
 * ```js
 * const map = new ExpiringMap();
 * map.set(`fruit`, `apple`);
 *
 * // Remove all entries that were set more than 100ms ago
 * map.deleteWithElapsed(100, `set`);
 * // Remove all entries that were last accessed more than 100ms ago
 * map.deleteWithElapsed(100, `get`);
 * // Returns the elapsed time since `fruit` was last accessed
 * map.elapsedGet(`fruit`);
 * // Returns the elapsed time since `fruit` was last set
 * map.elapsedSet(`fruit`);
 * ```
 *
 * Last set/get time for a key can be manually reset using `touch(key)`.
 *
 *
 * Events:
 * * `expired`: when an item is automatically removed.
 * * `removed`: when an item is manually or automatically removed.
 * * `newKey`: when a new key is added
 *
 * ```js
 * map.addEventListener(`expired`, evt => {
 *  const { key, value } = evt;
 * });
 * ```
 * The map can automatically remove items based on elapsed intervals.
 *
 * @example Automatically delete items that haven't been accessed for one second
 * ```js
 * const map = new ExpiringMap({
 *  autoDeleteElapsed: 1000,
 *  autoDeletePolicy: `get`
 * });
 * ```
 *
 * @example Automatically delete the oldest item if we reach a capacity limit
 * ```
 * const map = new ExpiringMap({
 *  capacity: 5,
 *  evictPolicy: `oldestSet`
 * });
 * ```
 */
export class ExpiringMap<K, V> extends SimpleEventEmitter<
  ExpiringMapEvents<K, V>
> {
  private capacity: number;
  private store: Map<K, Item<V>>;
  private keyCount: number;
  private evictPolicy;

  private autoDeleteElapsedMs: number;
  private autoDeletePolicy;

  constructor(opts: Opts = {}) {
    super();
    this.capacity = opts.capacity ?? -1;

    guardInteger(this.capacity, `nonZero`, `capacity`);
    this.store = new Map();
    this.keyCount = 0;

    if (opts.evictPolicy && this.capacity <= 0) {
      throw new Error(`evictPolicy is set, but no capacity limit is set`);
    }
    this.evictPolicy = opts.evictPolicy ?? `none`;
    this.autoDeleteElapsedMs = opts.autoDeleteElapsedMs ?? -1;
    this.autoDeletePolicy = opts.autoDeletePolicy ?? `none`;

    if (this.autoDeleteElapsedMs > 0) {
      setInterval(
        () => this.#maintain(),
        Math.max(1000, this.autoDeleteElapsedMs * 2)
      );
    }
  }

  /**
   * Returns the number of keys being stored.
   */
  get keyLength() {
    return this.keyCount;
  }

  *entries(): IterableIterator<[k: K, v: V]> {
    for (const entry of this.store.entries()) {
      yield [entry[0], entry[1].value];
    }
  }

  *values(): IterableIterator<V> {
    for (const v of this.store.values()) {
      yield v.value;
    }
  }

  *keys(): IterableIterator<K> {
    yield* this.store.keys();
  }

  /**
   * Returns the elapsed time since `key`
   * was set. Returns _undefined_ if `key`
   * does not exist
   */
  elapsedSet(key: K): number | undefined {
    const v = this.store.get(key);
    if (!v) return v;
    return Date.now() - v.lastSet;
  }

  /**
   * Returns the elapsed time since `key`
   * was accessed. Returns _undefined_ if `key`
   * does not exist
   */
  elapsedGet(key: K): number | undefined {
    const v = this.store.get(key);
    if (!v) return v;
    return Date.now() - v.lastGet;
  }

  /**
   * Returns true if `key` is stored.
   * Does not affect the key's last access time.
   * @param key
   * @returns
   */
  has(key: K): boolean {
    return this.store.has(key);
  }

  /**
   * Gets an item from the map by key, returning
   * undefined if not present
   * @param key Key
   * @returns Value, or undefined
   */
  get(key: K): V | undefined {
    const v = this.store.get(key);
    if (v) {
      return v.value;
    }
  }

  /**
   * Deletes the value under `key`, if present.
   *
   * Returns _true_ if something was removed.
   * @param key
   * @returns
   */
  delete(key: K): boolean {
    const val = this.store.get(key);
    if (!val) return false;
    const d = this.store.delete(key);
    this.keyCount = this.keyCount - 1;
    this.fireEvent(`removed`, {
      key,
      value: val.value,
    });
    return d;
  }

  /**
   * Updates the lastSet/lastGet time for a value
   * under `k`.
   *
   * Returns false if key was not found
   * @param key
   * @returns
   */
  touch(key: K): boolean {
    const v = this.store.get(key);
    if (!v) return false;
    this.store.set(key, {
      ...v,
      lastSet: Date.now(),
      lastGet: Date.now(),
    });
    return true;
  }

  private findEvicteeKey() {
    if (this.evictPolicy === `none`) return null;
    //eslint-disable-next-line functional/no-let
    let sortBy = ``;
    if (this.evictPolicy === `oldestGet`) sortBy = `lastGet`;
    else if (this.evictPolicy === `oldestSet`) sortBy = `lastSet`;
    else throw Error(`Unknown eviction policy ${this.evictPolicy}`);
    const sorted = sortByValueProperty(this.store, sortBy);
    return sorted[0][0];
  }

  #maintain() {
    if (this.autoDeletePolicy === `none`) return;
    this.deleteWithElapsed(this.autoDeleteElapsedMs, this.autoDeletePolicy);
  }

  /**
   * Deletes all values where elapsed time has past
   * for get/set or either.
   *
   * Remove items are returned
   * @param time
   * @param prop get/set/either
   */
  deleteWithElapsed(
    time: number,
    prop: `get` | `set` | `either`
  ): [k: K, v: V][] {
    const entries = [...this.store.entries()];
    const prune: [k: K, v: V][] = [];
    const now = Date.now();
    for (const e of entries) {
      const elapsedGet = now - e[1].lastGet;
      const elapsedSet = now - e[1].lastSet;
      const elapsed =
        prop === `get`
          ? elapsedGet
          : prop === `set`
          ? elapsedSet
          : Math.max(elapsedGet, elapsedSet);
      if (elapsed >= time) {
        prune.push([e[0], e[1].value]);
      }
    }

    for (const e of prune) {
      this.store.delete(e[0]);
      this.keyCount = this.keyCount - 1;
      const eventArgs = {
        key: e[0],
        value: e[1],
      };
      this.fireEvent(`expired`, eventArgs);
      this.fireEvent(`removed`, eventArgs);
    }
    return prune;
  }

  /**
   * Sets the `key` to be `value`.
   *
   * If the key already exists, it is updated.
   *
   * If the map is full, according to its capacity,
   * another value is selected for removal.
   * @param key
   * @param value
   * @returns
   */
  set(key: K, value: V) {
    const existing = this.store.get(key);

    if (existing) {
      // Update set time
      this.store.set(key, {
        ...existing,
        lastSet: performance.now(),
      });
      return;
    }

    // New key
    if (this.keyCount === this.capacity && this.capacity > 0) {
      // Evict first
      const key = this.findEvicteeKey();
      if (!key) {
        throw new Error(`ExpiringMap full (capacity: ${this.capacity})`);
      }
      const existing = this.store.get(key);
      this.store.delete(key);
      this.keyCount = this.keyCount - 1;
      if (existing) {
        const eventArgs = { key, value: existing.value };
        this.fireEvent(`expired`, eventArgs);
        this.fireEvent(`removed`, eventArgs);
      }
    }

    this.keyCount++;
    this.store.set(key, {
      lastGet: 0,
      lastSet: Date.now(),
      value: value,
    });

    this.fireEvent(`newKey`, { key, value });
  }
}
