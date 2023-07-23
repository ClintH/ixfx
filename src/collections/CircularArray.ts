import { integer as guardInteger } from '../Guards.js';

/**
 * The circular array is immutable. It keeps up to `capacity` items.
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
 * @class CircularArray
 * @extends {Array}
 * @template V
 */
export interface ICircularArray<V> extends Array<V> {
  /**
   * Returns true if the array has filled to capacity and is now
   * recycling array indexes.
   */
  get isFull(): boolean;

  /**
   * Returns a new Circular with item added
   *
   * Items are added at `pointer` position, which automatically cycles through available array indexes.
   *
   * @param {V} thing Thing to add
   * @returns {Circular<V>} Circular with item added
   * @memberof Circular
   */
  add(v: V): ICircularArray<V>;

  get length(): number;

  /**
   * Returns the current add position of array.
   */
  get pointer(): number;
}

class CircularArray<V> extends Array {
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

  add(thing: V): CircularArray<V> {
    const ca = CircularArray.from(this) as CircularArray<V>;
    /* eslint-disable-next-line functional/immutable-data */
    ca[this.#pointer] = thing;
    /* eslint-disable-next-line functional/immutable-data */
    ca.#capacity = this.#capacity;
    if (this.#capacity > 0) {
      /* eslint-disable-next-line functional/immutable-data */
      ca.#pointer =
        this.#pointer + 1 === this.#capacity ? 0 : this.#pointer + 1;
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
 *
 * @example Basic functions
 * ```js
 * let a = circularArray(10);
 * a = a.add(`hello`);  // Because it's immutable, capture the return result of `add`
 * a.isFull;            // True if circular array is full
 * a.pointer;           // The current position in array it will write to
 * ```
 *
 * Since it extends the regular JS array, you can access items as usual:
 * @example Accessing
 * ```js
 * let a = circularArray(10);
 * ... add some stuff ..
 * a.forEach(item => // do something with item);
 * ```
 * @param capacity Maximum capacity before recycling array entries
 * @return Circular array
 */
export const circularArray = <V>(capacity: number): ICircularArray<V> =>
  new CircularArray<V>(capacity);
