import {SimpleEventEmitter} from "../Events";

type KeyString<V> = (a: V) => string;
type MutableValueSetEventMap<V> = {
  add: {value: V, updated: boolean}
  clear: boolean
  delete: V
}
/**
 * A mutable set that stores unique items by their value,
 * not object reference.
 * 
 * Either pass a function to convert object to string in the ctor, or
 * ensure its JSON.stringify() output captures necessary values
 *
 * @export
 * @class MutableValueSet
 * @template V
 */
export class MutableValueSet<V> extends SimpleEventEmitter<MutableValueSetEventMap<V>>{
  store = new Map<string, V>();
  keyString: KeyString<V>;

  constructor(keyString: KeyString<V> | undefined = undefined) {
    super();
    if (keyString == undefined) keyString = (a) => JSON.stringify(a);
    this.keyString = keyString;
  }

  add(...v: V[]) {
    for (let i = 0; i < v.length; i++) {
      const updated = this.has(v[i]);
      this.store.set(this.keyString(v[i]), v[i]);
      super.fireEvent('add', {value: v[i], updated: updated});
    }
  }

  values() {
    return this.store.values();
  }

  clear() {
    this.store.clear();
    super.fireEvent('clear', true);
  }

  delete(v: V): boolean {
    const deleted = this.store.delete(this.keyString(v));
    if (deleted) super.fireEvent('delete', v);
    return deleted;
  }

  has(v: V): boolean {
    return this.store.has(this.keyString(v));
  }

  toArray(): V[] {
    return Array.from(this.store.values());
  }
}