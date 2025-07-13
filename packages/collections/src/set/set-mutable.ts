// ✔ UNIT TESTED
import { defaultKeyer, type ToString } from '@ixfx/core';
import { SimpleEventEmitter } from '@ixfx/events';//'../../Events.js';
import { type ISetMutable } from './ISetMutable.js';
import { type ValueSetEventMap } from './Types.js';

/**
 * Creates a {@link ISetMutable}.
 * @param keyString Function that produces a key based on a value. If unspecified, uses `JSON.stringify`
 * @returns
 */
export const mutable = <V>(
  keyString?: ToString<V>
): ISetMutable<V> => new SetStringMutable(keyString);

/**
 * Mutable string set
 */
export class SetStringMutable<V>
  extends SimpleEventEmitter<ValueSetEventMap<V>>
  implements ISetMutable<V> {
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
   * @param values items to add
   */
  add(...values: V[]): boolean {
    //eslint-disable-next-line functional/no-let
    let somethingAdded = false;
    for (const value of values) {
      const isUpdated = this.has(value);
      this.store.set(this.keyString(value), value);
      super.fireEvent(`add`, { value: value, updated: isUpdated });
      if (!isUpdated) somethingAdded = true;
    }
    return somethingAdded;
  }

  /**
   * Returns values from set as an iterable
   * @returns
   */
  //eslint-disable-next-line functional/prefer-tacit
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
    return [ ...this.store.values() ];
  }
}
