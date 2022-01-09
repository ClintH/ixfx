import {stack, stackMutable,  OverflowPolicy as StackOverflowPolicy} from './Stack';
//import {queue, queueMutable, QueueOpts, OverflowPolicy as QueueOverflowPolicy} from './Queue';

export {stack, stackMutable, StackOpts, StackOverflowPolicy};
export {queue, queueMutable, QueueOpts, QueueOverflowPolicy};

// ✔ UNIT TESTED!

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
  #capacity: number;
  #pointer: number;

  constructor(capacity: number) {
    super();
    if (Number.isNaN(capacity)) throw Error(`capacity is NaN`);
    if (capacity <= 0) throw Error(`capacity must be greater than zero`);
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
    ca[this.#pointer] = thing;
    ca.#capacity = this.#capacity;
    ca.#pointer = this.#pointer + 1 === this.#capacity ? 0 : this.#pointer + 1;
    return ca;
  }

  get isFull():boolean {
    return this.length === this.#capacity;
  }
}
