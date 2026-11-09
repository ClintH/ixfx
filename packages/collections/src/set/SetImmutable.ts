import type { ToString } from '@ixfx/core';
import type { ISetImmutable } from './ISetImmutable.js';
import { defaultKeyer, toStringDefault } from '@ixfx/core';

export class SetStringImmutable<V> implements ISetImmutable<V> {
  private store: Map<string, V>;
  private keyString;

  /**
   * Constructor
   * @param keyString Function to produce a key for a value
   * @param map Initial data. It is copied, so later changes to it don't affect the set.
   */
  constructor(keyString?: ToString<V>, map?: Map<string, V>) {
    this.store = map === undefined ? new Map<string, V>() : new Map(map);
    this.keyString = keyString ?? defaultKeyer<V>;
  }

  /**
   * Wraps `store` without copying. `store` must not be changed afterwards.
   */
  #withStore(store: Map<string, V>): SetStringImmutable<V> {
    const s = new SetStringImmutable<V>(this.keyString);
    s.store = store;
    return s;
  }

  get size(): number {
    return this.store.size;
  }

  add(...values: readonly V[]): ISetImmutable<V> {
    // Only copy once we find a value that actually changes the set
    let s: Map<string, V> | undefined;
    for (const v of values) {
      const key = this.keyString(v);
      if (s === undefined) {
        if (this.store.has(key) && Object.is(this.store.get(key), v))
          continue;
        s = new Map<string, V>(this.store);
      }
      s.set(key, v);
    }
    return s === undefined ? this : this.#withStore(s);
  }

  delete(v: V): ISetImmutable<V> {
    const key = this.keyString(v);
    if (!this.store.has(key))
      return this;
    const s = new Map<string, V>(this.store);
    s.delete(key);
    return this.#withStore(s);
  }

  has(v: V): boolean {
    const key = this.keyString(v);
    return this.store.has(key);
  }

  toArray(): V[] {
    return [...this.store.values()];
  }

  * values(): Generator<V, void, unknown> {
    yield* this.store.values();
  }
}

/**
 * Immutable set that uses a `keyString` function to determine uniqueness
 *
 * @param keyString Function that produces a key based on a value. If unspecified, uses `JSON.stringify`.
 * @returns
 */
export function immutable<V>(keyString: ToString<V> = toStringDefault): ISetImmutable<V> {
  return new SetStringImmutable(keyString);
}
