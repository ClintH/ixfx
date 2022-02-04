import {SimpleMapArrayMutable} from "./Interfaces.js";

class SimpleMapArrayMutableImpl<V> {
  /* eslint-disable-next-line functional/prefer-readonly-type */
  readonly #map: Map<string, ReadonlyArray<V>> = new Map();

  add(key: string, ...values: ReadonlyArray<V>) {
    const existing = this.#map.get(key);
    if (existing === undefined) {
      this.#map.set(key, values);
    } else {
      this.#map.set(key, [...existing, ...values]);
    }
  }

  debugString(): string {
    // eslint-disable-next-line functional/no-let
    let r = ``;
    const keys = Array.from(this.#map.keys());
    keys.every(k => {
      const v = this.#map.get(k);
      if (v === undefined) return;
      r += k + ` (${v.length}) = ${JSON.stringify(v)}\r\n`;
    });
    return r;
  }

  get(key: string): ReadonlyArray<V> | undefined {
    return this.#map.get(key);
  }

  delete(key: string, v: V): boolean {
    const existing = this.#map.get(key);
    if (existing === undefined) return false;
    const without = existing.filter(i => i !== v);
    this.#map.set(key, without);
    return without.length < existing.length;
  }

  clear() {
    this.#map.clear();
  }
}

/**
 * A simple mutable map of arrays, without events. It can store multiple values
 * under the same key.
 * 
 * For a fancier approaches, consider {@link mapArray}, {@link mapCircular} or {@link mapSet}.
 * 
 * @example
 * ```js
 * const m = simpleMapArrayMutable();
 * m.add(`hello`, 1, 2, 3); // Adds numbers under key `hello`
 * m.delete(`hello`);       // Deletes everything under `hello`
 * 
 * const hellos = m.get(`hello`); // Get list of items under `hello`
 * ```
 *
 * @template V Type of items
 * @returns New instance
 */
export const simpleMapArrayMutable = <V>():SimpleMapArrayMutable<V> => new SimpleMapArrayMutableImpl();