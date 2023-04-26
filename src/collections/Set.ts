// ✔ UNIT TESTED
import { ToString } from "../Util.js";
import { SimpleEventEmitter } from "../Events.js";
import { SetMutable, SetImmutable, ValueSetEventMap } from "./Interfaces.js";

class StringSetImpl<V> implements SetImmutable<V> {
  private store:Map<string, V>;
  private keyString;

  constructor(keyString?:ToString<V>, map?:Map<string, V>) {
    this.store = map ?? new Map<string, V>();
    this.keyString = keyString ?? defaultKeyer<V>;
  }

  get size():number {
    return this.store.size;
  }

  add(...values:readonly V[]):SetImmutable<V> {
    const s = new Map<string, V>(this.store);
    for (const v of values) {
      const key = this.keyString(v);
      s.set(key, v);
    }
    return new StringSetImpl<V>(this.keyString, s);
  }

  delete(v:V):SetImmutable<V> {
    const s = new Map<string, V>(this.store);
    const key = this.keyString(v);
    if (s.delete(key)) return new StringSetImpl(this.keyString, s);
    return this;
  }

  has(v:V):boolean {
    const key = this.keyString(v);
    return this.store.has(key);
  }

  toArray():V[] {
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
export const set = <V>(keyString:ToString<V>):SetImmutable<V> => new StringSetImpl(keyString);

/**
 * Creates a {@link SetMutable}.
 * @param keyString Function that produces a key based on a value. If unspecified, uses `JSON.stringify`
 * @returns 
 */
export const setMutable = <V>(keyString:ToString<V> | undefined = undefined):SetMutable<V> => new MutableStringSetImpl(keyString);

const defaultKeyer= <V>(a:V) => {
  if (typeof a === `string`) { 
    return a;
  } else { 
    return JSON.stringify(a);
  }
};

class MutableStringSetImpl<V> extends SimpleEventEmitter<ValueSetEventMap<V>> implements SetMutable<V> {
  // ✔ UNIT TESTED
  /* eslint-disable functional/prefer-readonly-type */
  store = new Map<string, V>();
  keyString:ToString<V>;

  constructor(keyString:ToString<V> | undefined = undefined) {
    super();
    this.keyString = keyString ?? defaultKeyer<V>;
  }

  get size() {
    return this.store.size;
  }

  add(...v:ReadonlyArray<V>) {
    v.forEach(i => {
      const isUpdated = this.has(i);
      this.store.set(this.keyString(i), i);
      super.fireEvent(`add`, { value: i, updated: isUpdated });
    });
  }

  values() {
    return this.store.values();
  }

  clear() {
    this.store.clear();
    super.fireEvent(`clear`, true);
  }

  delete(v:V):boolean {
    const isDeleted = this.store.delete(this.keyString(v));
    if (isDeleted) super.fireEvent(`delete`, v);
    return isDeleted;
  }

  has(v:V):boolean {
    return this.store.has(this.keyString(v));
  }

  toArray():V[] {
    return Array.from(this.store.values());
  }
}