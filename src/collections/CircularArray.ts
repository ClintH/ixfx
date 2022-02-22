import {CircularArray} from "./Interfaces.js";
import { integer as guardInteger } from "../Guards.js";

class CircularArrayImpl<V> extends Array {
  // ✔ Class is unit tested!
  /* eslint-disable-next-line functional/prefer-readonly-type */
  #capacity: number;
  /* eslint-disable-next-line functional/prefer-readonly-type */
  #pointer: number;

  constructor(capacity: number = 0) {
    super();
    // Allowed to create with capacity zero
    guardInteger(capacity, `positive`, `capacity`);

    // Can't throw because .filter won't use ctor proprly
    this.#capacity = capacity;
    this.#pointer = 0;
  }

  add(thing: V): CircularArrayImpl<V> {
    const ca = CircularArrayImpl.from(this) as CircularArrayImpl<V>;
    /* eslint-disable-next-line functional/immutable-data */
    ca[this.#pointer] = thing;
    /* eslint-disable-next-line functional/immutable-data */
    ca.#capacity = this.#capacity;
    if (this.#capacity > 0) {
      /* eslint-disable-next-line functional/immutable-data */
      ca.#pointer = this.#pointer + 1 === this.#capacity ? 0 : this.#pointer + 1;
    } else {
      /* eslint-disable-next-line functional/immutable-data */
      ca.#pointer = this.#pointer + 1;
    }
    return ca;
  }

  get pointer(): number {
    return this.#pointer;
  }

  get isFull(): boolean {
    if (this.#capacity === 0) return false;
    return this.length === this.#capacity;
  }
}


/**
 * Returns a new circular array. Immutable. A circular array only keeps up to `capacity` items.
 * Old items are overridden with new items.
 * 
 * `CircularArray` extends the regular JS array. Only use `add` to change the array if you want
 * to keep the `CircularArray` behaviour.
 * @example
 * ```js
 * let a = circularArray(10);
 * a = a.add(`hello`); // Because it's immutable, capture the return result of `add`
 * a.isFull;  // True if circular array is full
 * a.pointer; // The current position in array it will write to
 * ```
 * @template V Value of array items
 * @param {number} capacity Capacity.
 * @return {*}  {CircularArray<V>}
 */
export const circularArray = <V>(capacity:number): CircularArray<V> => new CircularArrayImpl<V>(capacity);
