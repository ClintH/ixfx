import { SimpleEventEmitter } from '@ixfx/events';
import { sortByValueProperty } from '@ixfx/core/maps';
import { intervalToMs, type Interval } from '@ixfx/core';
import { throwIntegerTest } from '@ixfx/guards';

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
 * @param options Options when creating map
 * @returns
 */
export const create = <K, V>(options: Opts = {}): ExpiringMap<K, V> =>
  new ExpiringMap(options);
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
 * Last set/get time for a key can be manually reset using {@link touch}.
 *
 *
 * Events:
 * * 'expired': when an item is automatically removed.
 * * 'removed': when an item is manually or automatically removed.
 * * 'newKey': when a new key is added
 *
 * ```js
 * map.addEventListener(`expired`, evt => {
 *  const { key, value } = evt;
 * });
 * ```
 * The map can automatically remove items based on elapsed intervals.
 *
 * @example
 * Automatically delete items that haven't been accessed for one second
 * ```js
 * const map = new ExpiringMap({
 *  autoDeleteElapsed: 1000,
 *  autoDeletePolicy: `get`
 * });
 * ```
 *
 * @example
 * Automatically delete the oldest item if we reach a capacity limit
 * ```js
 * const map = new ExpiringMap({
 *  capacity: 5,
 *  evictPolicy: `oldestSet`
 * });
 * ```
 * @typeParam K - Type of keys
 * @typeParam V - Type of values
 */
export class ExpiringMap<K, V> extends SimpleEventEmitter<
  ExpiringMapEvents<K, V>
> {
  private capacity: number;
  private store: Map<K, Item<V>>;
  //private keyCount: number;
  private evictPolicy;

  private autoDeleteElapsedMs: number;
  private autoDeletePolicy;
  private autoDeleteTimer: ReturnType<typeof setInterval> | undefined;
  private disposed = false;
  constructor(opts: Opts = {}) {
    super();
    this.capacity = opts.capacity ?? -1;

    throwIntegerTest(this.capacity, `nonZero`, `capacity`);
    this.store = new Map();
    //this.keyCount = 0;

    if (opts.evictPolicy && this.capacity <= 0) {
      throw new Error(`evictPolicy is set, but no capacity limit is set`);
    }
    this.evictPolicy = opts.evictPolicy ?? `none`;
    this.autoDeleteElapsedMs = opts.autoDeleteElapsedMs ?? -1;
    this.autoDeletePolicy = opts.autoDeletePolicy ?? `none`;

    if (this.autoDeleteElapsedMs > 0) {
      this.autoDeleteTimer = setInterval(
        () => { this.#maintain(); },
        Math.max(1000, this.autoDeleteElapsedMs * 2)
      );
    }
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    if (this.autoDeleteTimer) {
      clearInterval(this.autoDeleteTimer)
      this.autoDeleteTimer = undefined;
    }
  }
  /**
   * Returns the number of keys being stored.
   */
  get keyLength() {
    return this.store.size;// keyCount;
  }

  *entries(): IterableIterator<[ k: K, v: V ]> {
    for (const entry of this.store.entries()) {
      yield [ entry[ 0 ], entry[ 1 ].value ];
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
    if (typeof v === `undefined`) return;
    return Date.now() - v.lastSet;
  }

  /**
   * Returns the elapsed time since `key`
   * was accessed. Returns _undefined_ if `key`
   * does not exist
   */
  elapsedGet(key: K): number | undefined {
    const v = this.store.get(key);
    if (typeof v === `undefined`) return;
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
      if (this.autoDeletePolicy === `either` || this.autoDeletePolicy === `get`) {
        this.store.set(key, {
          ...v,
          lastGet: performance.now(),
        });
      }
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
    const value = this.store.get(key);
    if (!value) return false;
    const d = this.store.delete(key);
    //this.keyCount = this.keyCount - 1;
    this.fireEvent(`removed`, {
      key,
      value: value.value,
    });
    return d;
  }

  /**
   * Clears the contents of the map.
   * Note: does not fire `removed` event
   */
  clear() {
    this.store.clear();
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

  private findEvicteeKey(): K | undefined {
    if (this.evictPolicy === `none`) return;
    let sortBy = ``;
    if (this.evictPolicy === `oldestGet`) sortBy = `lastGet`;
    else if (this.evictPolicy === `oldestSet`) sortBy = `lastSet`;
    else throw new Error(`Unknown eviction policy ${ this.evictPolicy }`);
    const sorted = sortByValueProperty(this.store, sortBy);
    return sorted[ 0 ][ 0 ];
  }

  #maintain() {
    if (this.autoDeletePolicy === `none`) return;
    this.deleteWithElapsed(this.autoDeleteElapsedMs, this.autoDeletePolicy);
  }

  /**
   * Deletes all values where elapsed time has past
   * for get/set or either.
   * ```js
   * // Delete all keys (and associated values) not accessed for a minute
   * em.deleteWithElapsed({mins:1}, `get`);
   * // Delete things that were set 1s ago
   * em.deleteWithElapsed(1000, `set`);
   * ```
   * 
   * @param interval Interval
   * @param property Basis for deletion 'get','set' or 'either'
   * @returns Items removed
   */
  deleteWithElapsed(
    interval: Interval,
    property: `get` | `set` | `either`
  ): [ k: K, v: V ][] {
    const entries = [ ...this.store.entries() ];
    const prune: [ k: K, v: V ][] = [];
    const intervalMs = intervalToMs(interval, 1000);
    const now = performance.now();
    for (const entry of entries) {
      const elapsedGet = now - entry[ 1 ].lastGet;
      const elapsedSet = now - entry[ 1 ].lastSet;
      const elapsed =
        property === `get`
          ? elapsedGet
          : (property === `set`
            ? elapsedSet
            : Math.max(elapsedGet, elapsedSet));
      if (elapsed >= intervalMs) {
        prune.push([ entry[ 0 ], entry[ 1 ].value ]);
      }
    }

    for (const entry of prune) {
      this.store.delete(entry[ 0 ]);
      //this.keyCount = this.keyCount - 1;
      const eventArguments = {
        key: entry[ 0 ],
        value: entry[ 1 ],
      };
      this.fireEvent(`expired`, eventArguments);
      this.fireEvent(`removed`, eventArguments);
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
    if (this.keyLength === this.capacity && this.capacity > 0) {
      // Evict first
      const key = this.findEvicteeKey();
      if (!key) {
        throw new Error(`ExpiringMap full (capacity: ${ this.capacity })`);
      }
      const existing = this.store.get(key);
      this.store.delete(key);
      //this.keyCount = this.keyCount - 1;
      if (existing) {
        const eventArguments = { key, value: existing.value };
        this.fireEvent(`expired`, eventArguments);
        this.fireEvent(`removed`, eventArguments);
      }
    }

    //this.keyCount++;
    this.store.set(key, {
      lastGet: 0,
      lastSet: performance.now(),
      value: value,
    });

    this.fireEvent(`newKey`, { key, value });
  }
}
