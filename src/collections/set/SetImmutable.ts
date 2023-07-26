import { type ToString, defaultKeyer, toStringDefault } from '../../Util.js';
import { type ISetImmutable } from './index.js';

export class StringSet<V> implements ISetImmutable<V> {
  private store: Map<string, V>;
  private keyString;

  //eslint-disable-next-line functional/prefer-immutable-types
  constructor(keyString?: ToString<V>, map?: Map<string, V>) {
    this.store = map ?? new Map<string, V>();
    this.keyString = keyString ?? defaultKeyer<V>;
  }

  get size(): number {
    return this.store.size;
  }

  add(...values: readonly V[]): ISetImmutable<V> {
    const s = new Map<string, V>(this.store);
    for (const v of values) {
      const key = this.keyString(v);
      s.set(key, v);
    }
    return new StringSet<V>(this.keyString, s);
  }

  delete(v: V): ISetImmutable<V> {
    const s = new Map<string, V>(this.store);
    const key = this.keyString(v);
    if (s.delete(key)) return new StringSet(this.keyString, s);
    return this;
  }

  has(v: V): boolean {
    const key = this.keyString(v);
    return this.store.has(key);
  }

  toArray(): V[] {
    return [...this.store.values()];
  }

  *values() {
    yield* this.store.values();
  }
}

/**
 * Immutable set that uses a `keyString` function to determine uniqueness
 *
 * @param keyString Function that produces a key based on a value. If unspecified, uses `JSON.stringify`.
 * @returns
 */
export const immutable = <V>(keyString: ToString<V> = toStringDefault): ISetImmutable<V> =>
  new StringSet(keyString);
