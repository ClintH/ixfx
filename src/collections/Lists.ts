import {stack, stackMutable,  OverflowPolicy as StackOverflowPolicy} from './Stack.js';
import {queue, queueMutable, OverflowPolicy as QueueOverflowPolicy} from './Queue.js';
import {IsEqual, isEqualDefault} from '../util.js';

export {stack, stackMutable, StackOverflowPolicy};
export {queue, queueMutable, QueueOverflowPolicy};

export const randomElement = <V>(array: ArrayLike<V>): V => array[Math.floor(Math.random() * array.length)];
export const shuffle = (dataToShuffle:ReadonlyArray<unknown>): ReadonlyArray<unknown> => {
  const array = [...dataToShuffle];
  // eslint-disable-next-line functional/no-loop-statement, functional/no-let
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

/**
 * Returns an array with a value omitted.
 * Value checking is completed via the provided `comparer` function, or by default checking whether `a === b`.
 *
 * @template V
 * @param {ReadonlyArray<V>} data
 * @param {V} value
 * @param {IsEqual<V>} [comparer=isEqualDefault]
 * @return {*}  {ReadonlyArray<V>}
 */
export const without = <V>(data:ReadonlyArray<V>, value:V, comparer:IsEqual<V> = isEqualDefault):ReadonlyArray<V> => data.filter(v => !comparer(v, value));

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
export class Circular<V> extends Array {
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
  add(thing: V): Circular<V> {
    const ca = Circular.from(this) as Circular<V>;
    /* eslint-disable-next-line functional/immutable-data */
    ca[this.#pointer] = thing;
    /* eslint-disable-next-line functional/immutable-data */
    ca.#capacity = this.#capacity;
    /* eslint-disable-next-line functional/immutable-data */
    ca.#pointer = this.#pointer + 1 === this.#capacity ? 0 : this.#pointer + 1;
    return ca;
  }

  get pointer():number {
    return this.#pointer;
  }

  get isFull():boolean {
    if (this.#capacity === 0) return false;
    return this.length === this.#capacity;
  }
}
