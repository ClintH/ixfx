import { defaultKeyer } from '../../DefaultKeyer.js';
import { type ToString, toStringDefault } from '../../Util.js';
import { type ISetImmutable } from './ISetImmutable.js';

export class SetStringImmutable<V> implements ISetImmutable<V> {
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

  add(...values: ReadonlyArray<V>): ISetImmutable<V> {
    const s = new Map<string, V>(this.store);
    for (const v of values) {
      const key = this.keyString(v);
      s.set(key, v);
    }
    return new SetStringImmutable<V>(this.keyString, s);
  }

  delete(v: V): ISetImmutable<V> {
    const s = new Map<string, V>(this.store);
    const key = this.keyString(v);
    if (s.delete(key)) return new SetStringImmutable(this.keyString, s);
    return this;
  }

  has(v: V): boolean {
    const key = this.keyString(v);
    return this.store.has(key);
  }

  toArray(): Array<V> {
    return [ ...this.store.values() ];
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
export const immutable = <V>(
  keyString: ToString<V> = toStringDefault
): ISetImmutable<V> => new SetStringImmutable(keyString);
