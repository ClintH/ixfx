import { integerTest, resultThrow } from "@ixfx/guards";


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
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
   * @param value Thing to add
   * @returns Circular with item added
   */
  add(value: V): ICircularArray<V>;

  get length(): number;

  /**
   * Returns the current add position of array.
   */
  get pointer(): number;
}

/**
 * A circular array keeps a maximum number of values, overwriting older values as needed. Immutable.
 *
 * `CircularArray` extends the regular JS array. Only use `add` to change the array if you want
 * to keep the `CircularArray` behaviour.
 *
 * @example Basic functions
 * ```js
 * let a = new CircularArray(10);
 * a = a.add(`hello`);  // Because it's immutable, capture the return result of `add`
 * a.isFull;            // True if circular array is full
 * a.pointer;           // The current position in array it will write to
 * ```
 *
 * Since it extends the regular JS array, you can access items as usual:
 * @example Accessing
 * ```js
 * let a = new CircularArray(10);
 * ... add some stuff ..
 * a.forEach(item => // do something with item);
 * ```
 * @param capacity Maximum capacity before recycling array entries
 * @return Circular array
 */
export class CircularArray<V> extends Array {
  #capacity: number;
  #pointer: number;

  constructor(capacity = 0) {
    super();
    // Allowed to create with capacity zero
    resultThrow(integerTest(capacity, `positive`, `capacity`));

    // Can't throw because .filter won't use ctor proprly
    this.#capacity = capacity;
    this.#pointer = 0;
  }

  /**
   * Add to array
   * @param value Thing to add
   * @returns 
   */
  add(value: V): CircularArray<V> {
    const ca = CircularArray.from(this) as CircularArray<V>;
    ca[ this.#pointer ] = value;
    ca.#capacity = this.#capacity;
    if (this.#capacity > 0) {
      ca.#pointer =
        this.#pointer + 1 === this.#capacity ? 0 : this.#pointer + 1;
    } else {
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
