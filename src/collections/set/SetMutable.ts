// ✔ UNIT TESTED
import {type ToString, defaultKeyer} from "../../Util.js";
import {SimpleEventEmitter} from "../../Events.js";
import {type ISetMutable} from "./ISetMutable.js";
import {type ValueSetEventMap} from "./index.js";

/**
 * Creates a {@link ISetMutable}.
 * @param keyString Function that produces a key based on a value. If unspecified, uses `JSON.stringify`
 * @returns 
 */
export const mutable = <V>(keyString?: ToString<V> | undefined): ISetMutable<V> => new MutableStringSet(keyString);

/**
 * Mutable string set
 */
export class MutableStringSet<V> extends SimpleEventEmitter<ValueSetEventMap<V>> implements ISetMutable<V> {
  // ✔ UNIT TESTED
  /* eslint-disable functional/prefer-readonly-type */
  store = new Map<string, V>();
  keyString: ToString<V>;

  /**
   * Constructor
   * @param keyString Function which returns a string version of added items. If unspecified `JSON.stringify`
   */
  constructor(keyString: ToString<V> | undefined) {
    super();
    this.keyString = keyString ?? defaultKeyer<V>;
  }

  /**
   * Number of items stored in set
   */
  get size() {
    return this.store.size;
  }

  /**
   * Adds one or more items to set. `add` event is fired for each item
   * @param v items to add
   */
  add(...v: ReadonlyArray<V>) {
    v.forEach(i => {
      const isUpdated = this.has(i);
      this.store.set(this.keyString(i), i);
      super.fireEvent(`add`, {value: i, updated: isUpdated});
    });
  }

  /**
   * Returns values from set as an iterable
   * @returns 
   */
  values() {
    return this.store.values();
  }

  /**
   * Clear items from set
   */
  clear() {
    this.store.clear();
    super.fireEvent(`clear`, true);
  }

  /**
   * Delete value from set.
   * @param v Value to delete
   * @returns _True_ if item was found and removed
   */
  delete(v: V): boolean {
    const isDeleted = this.store.delete(this.keyString(v));
    if (isDeleted) super.fireEvent(`delete`, v);
    return isDeleted;
  }

  /**
   * Returns _true_ if item exists in set
   * @param v 
   * @returns 
   */
  has(v: V): boolean {
    return this.store.has(this.keyString(v));
  }

  /**
   * Returns array copy of set
   * @returns Array copy of set
   */
  toArray(): V[] {
    return Array.from(this.store.values());
  }
}