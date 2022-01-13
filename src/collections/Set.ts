// ✔ UNIT TESTED
import { ToString } from "../util";
import {SimpleEventEmitter} from "../Events";

type MutableValueSetEventMap<V> = {
  readonly add: {readonly value: V, readonly updated: boolean}
  readonly clear: boolean
  readonly delete: V
}

/**
 * A mutable set that stores unique items by their value, rather
 * than object reference.
 * 
 * By default the JSON.stringify() representation is used to compare
 * objects. Alternatively, pass a function into the constructor
 *
 * It also fires `add`, `clear` and `delete` events.
 * 
 * Usage
 * ```
 * .add(item);    // Add one or more items. Items with same key are overriden.
 * .has(item);    // Returns true if item *value* is present
 * .clear();      // Remove everything
 * .delete(item); // Delete item by value
 * .toArray();    // Returns values as an array
 * .values();     // Returns an iterator over values
 * ```
 * 
 * Example
 * ```
 * const people = [
 *  {name: `Barry`, city: `London`}
 *  {name: `Sally`, city: `Bristol`}
 * ];
 * const set = new MutableValueSet(person => {
 *  // Key person objects by name and city (assi)
 *  return `${person.name}-${person.city}`
 * });
 * set.add(...people);
 * 
 * set.has({name:`Barry`, city:`Manchester`})); // False, key is different (Barry-Manchester)
 * set.has({name:`Barry`, city:`London`}));     // True, we have Barry-London as a key
 * set.has(people[1]);   // True, key of object is found (Sally-Bristol)
 * 
 * set.addEventListener(`add`, newItem => {
 *  console.log(`New item added: ${newItem}`);
 * });
 * ```
 * @export
 * @class MutableValueSet
 * @template V
 */
export class MutableValueSet<V> extends SimpleEventEmitter<MutableValueSetEventMap<V>> {
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
    const deleted = this.store.delete(this.keyString(v));
    if (deleted) super.fireEvent(`delete`, v);
    return deleted;
  }

  has(v: V): boolean {
    return this.store.has(this.keyString(v));
  }

  toArray(): V[] {
    return Array.from(this.store.values());
  }
}