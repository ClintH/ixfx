import { SimpleEventEmitter } from "@ixfx/events";
import type { IMapMutable } from "./map-mutable.js";
import type { EitherKey } from "../types.js";

export type MapWithEventsEvents<TKey, TValue> = {
  'removed': { key: TKey, value: TValue }
  'added': { key: TKey, value: TValue }
  'key-added': { key: TKey, value: TValue }
  'key-updated': { key: TKey, value: TValue }
  'cleared': undefined
}

/**
 * A wrapper around a regular Map, but one that fires events when data changes.
 * 
 * Events:
 * * removed: Key/value removed
 * * added: Key/value added/updated
 * * key-added: Key/value pair added that resulted in a new key
 * * key-updated: Value updated for an existing key
 * * cleared: Map has been cleared
 */
export class MapWithEvents<TKey, TValue> extends SimpleEventEmitter<MapWithEventsEvents<TKey, TValue>> implements IMapMutable<TKey, TValue> {
  #map = new Map<TKey, TValue>();

  add(...itemsToAdd: EitherKey<TKey, TValue>): void {
    for (const kv of itemsToAdd) {
      if (`key` in kv && `value` in kv) {
        this.set(kv.key, kv.value);
      } else {
        this.set(kv[ 0 ], kv[ 1 ]);
      }
    }
  }

  set(key: TKey, value: TValue): void {
    const newKey = this.#map.has(key);
    this.#map.set(key, value);
    const kv = { key, value };
    if (newKey) {
      this.fireEvent(`key-added`, kv);
    } else {
      this.fireEvent(`key-updated`, kv);
    }
    this.fireEvent(`added`, kv);
  }

  delete(key: TKey): void {
    const value = this.#map.get(key);
    if (value === undefined) return;
    this.#map.delete(key);
    this.fireEvent(`removed`, { key, value })
  }

  clear(): void {
    this.#map.clear();
    this.fireEvent(`cleared`, undefined);
  }

  get(key: TKey): TValue | undefined {
    return this.#map.get(key);
  }
  has(key: TKey): boolean {
    return this.#map.has(key);
  }
  isEmpty(): boolean {
    return this.#map.size === 0
  }
  entries(): IterableIterator<readonly [ TKey, TValue ]> {
    return this.#map.entries();
  }
  values(): IterableIterator<TValue> {
    return this.#map.values();
  }

}