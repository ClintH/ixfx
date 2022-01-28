/**
 * The circular array grows to a fixed size. Once full, new
 * items replace the oldest item in the array. Immutable.
 *
 * Usage:
 * ```
 * let a = new Circular(10);
 * let b = a.add(something);
 * ```
 * @class CircularArray
 * @extends {Array}
 * @template V
 */
export class MutableCircularArray<V> extends Array {
  // ✔ Class is unit tested!
  /* eslint-disable-next-line functional/prefer-readonly-type */
  #capacity: number;
  /* eslint-disable-next-line functional/prefer-readonly-type */
  #pointer: number;

  constructor(capacity: number) {
    super();
    if (Number.isNaN(capacity)) throw Error(`capacity is NaN`);
    // Can't throw because .filter won't use ctor proprly
    //if (capacity <= 0) throw Error(`capacity must be greater than zero (${capacity})`);
    this.#capacity = capacity;
    this.#pointer = 0;
  }

  /**
   * Returns a new Circular with item added
   *
   * @param {V} thing Thing to add
   * @returns {Circular<V>} Circular with item added
   * @memberof Circular
   */
  add(thing: V): MutableCircularArray<V> {
    const ca = MutableCircularArray.from(this) as MutableCircularArray<V>;
    /* eslint-disable-next-line functional/immutable-data */
    ca[this.#pointer] = thing;
    /* eslint-disable-next-line functional/immutable-data */
    ca.#capacity = this.#capacity;
    /* eslint-disable-next-line functional/immutable-data */
    ca.#pointer = this.#pointer + 1 === this.#capacity ? 0 : this.#pointer + 1;
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
 * Returns a new mutable circular array
 *
 * @template V
 * @param {number} capacity
 * @return {*}  {CircularArray<V>}
 */
export const mutableCircularArray = <V>(capacity:number): MutableCircularArray<V> => new MutableCircularArray<V>(capacity);
