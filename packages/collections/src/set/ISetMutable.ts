import { SimpleEventEmitter } from '@ixfx/events';
import type { ValueSetEventMap } from './Types.js';

/**
 * A Set which stores unique items determined by their value, rather
 * than object reference (unlike the default JS Set). Create with {@link Sets.mutable}. Mutable.
 *
 * By default the `JSON.stringify()` representation is considered the 'key' for an object.
 * Pass in a function to `Sets.mutable` to define your own way of creating keys for values. The principle should
 * be that objects that you consider identical should have the same string key value.
 *
 * ISetMutable fires `add`, `clear` and `delete` events.
 *
 * @example Overview of functions
 * ```js
 * const s = Sets.mutable();
 * s.add(item);    // Add one or more items. Items with same key are overriden.
 * s.has(item);    // Returns true if item value is present
 * s.clear();      // Remove everything
 * s.delete(item); // Delete item by value
 * s.toArray();    // Returns values as an array
 * s.values();     // Returns an iterator over values
 * s.size;         // Number of items stored in set
 * ```
 *
 * @example Example usage
 * ```js
 * // Data to add
 * const people = [
 *  {name: `Barry`, city: `London`}
 *  {name: `Sally`, city: `Bristol`}
 * ];
 *
 * // Create a set, defining how keys will be generated
 * const set = Sets.mutable(person => {
 *    // Key person objects by name and city.
 *    // ie. Generated keys will be: `Barry-London`, `Sally-Bristol`
 *    return `${person.name}-${person.city}`
 * });
 *
 * // Add list
 * set.add(...people);
 *
 * // Demo:
 * set.has({name:`Barry`, city:`Manchester`})); // False, key is different (Barry-Manchester)
 * set.has({name:`Barry`, city:`London`}));     // True, we have Barry-London as a key
 * set.has(people[1]);   // True, key of object is found (Sally-Bristol)
 * ```
 *
 * @example
 * Events
 * ```js
 * set.addEventListener(`add`, ev => {
 *  console.log(`New item added: ${ev.value}`);
 * });
 * ```
 *
 * @typeParam V - Type of data stored
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface ISetMutable<V>
  extends SimpleEventEmitter<ValueSetEventMap<V>> {
  /**
   * Add `values` to set.
   * Corresponding keys will be generated according to the
   * function provided to `setMutable`, or `JSON.stringify` by default.
   * @param values Value(s) to add
   * @returns _true_ if something new was added
   */
  add(...values: readonly V[]): boolean;

  /**
   * Iterate over values
   * ```js
   * for (let value of set.values()) {
   *    // use value...
   * }
   * ```
   */
  values(): IterableIterator<V>;

  /**
   * Clears set
   */
  clear(): void;

  /**
   * Deletes specified value, if present.
   * @param value
   * @returns True if value was found
   */
  delete(value: V): boolean;

  /**
   * Returns _true_ if _value_ is contained in Set
   * @param value
   */
  has(value: V): boolean;

  /**
   * Returns an array of values
   */
  toArray(): readonly V[];

  /**
   * Returns the number of items stored in the set
   */
  get size(): number;
}
