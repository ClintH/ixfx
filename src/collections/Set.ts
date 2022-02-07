// ✔ UNIT TESTED

import { ToString } from "../util.js";
import {SimpleEventEmitter} from "../Events.js";
import {SetMutable, ValueSetEventMap} from "./Interfaces.js";

/**
 * @inheritdoc SetMutable
 * @param keyString Function that produces a key for items. If unspecified uses JSON.stringify
 * @returns 
 */
export const setMutable = <V>(keyString: ToString<V> | undefined = undefined):SetMutable<V> => new MutableStringSetImpl(keyString);

class MutableStringSetImpl<V> extends SimpleEventEmitter<ValueSetEventMap<V>> implements SetMutable<V> {
  // ✔ UNIT TESTED
  /* eslint-disable functional/prefer-readonly-type */
  store = new Map<string, V>();
  keyString: ToString<V>;

  constructor(keyString: ToString<V> | undefined = undefined) {
    super();
    
    if (keyString === undefined) {
      keyString = (a) => {
        if (typeof a === `string`) { 
          return a;
        } else { 
          return JSON.stringify(a);
        }
      };
    }
    this.keyString = keyString;
  }

  add(...v: ReadonlyArray<V>) {
    v.forEach(i => {
      const isUpdated = this.has(i);
      this.store.set(this.keyString(i), i);
      super.fireEvent(`add`, { value: i, updated: isUpdated});
    });
  }

  values() {
    return this.store.values();
  }

  clear() {
    this.store.clear();
    super.fireEvent(`clear`, true);
  }

  delete(v: V): boolean {
    const isDeleted = this.store.delete(this.keyString(v));
    if (isDeleted) super.fireEvent(`delete`, v);
    return isDeleted;
  }

  has(v: V): boolean {
    return this.store.has(this.keyString(v));
  }

  toArray(): V[] {
    return Array.from(this.store.values());
  }
}