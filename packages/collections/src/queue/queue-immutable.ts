import type { IQueueImmutable } from './iqueue-immutable.js';
import { peek, isFull, isEmpty, enqueue, dequeue } from './queue-fns.js';
import { type QueueOpts } from './queue-types.js';

// -------------------------------
// Immutable
// -------------------------------
export class QueueImmutable<V> implements IQueueImmutable<V> {
  readonly opts: QueueOpts<V>;
  #data: readonly V[];

  /**
   * Creates an instance of Queue.
   * @param {QueueOpts} opts Options foor queue
   * @param {V[]} data Initial data. Index 0 is front of queue
   */
  constructor(opts: QueueOpts<V> = {}, data: readonly V[] = []) {
    if (opts === undefined) throw new Error(`opts parameter undefined`);

    this.opts = opts;
    this.#data = data;
  }

  forEach(fn: (v: V) => void) {
    //eslint-disable-next-line functional/no-let
    for (let index = this.#data.length - 1; index >= 0; index--) {
      fn(this.#data[ index ]);
    }
  }

  forEachFromFront(fn: (v: V) => void) {
    // From front of queue

    this.#data.forEach(item => { fn(item) }); //(vv) => fn(vv));
  }

  enqueue(...toAdd: readonly V[] | V[]): QueueImmutable<V> {
    return new QueueImmutable<V>(
      this.opts,
      enqueue(this.opts, this.#data, ...toAdd)
    );
  }

  dequeue(): QueueImmutable<V> {
    return new QueueImmutable<V>(this.opts, dequeue(this.opts, this.#data));
  }

  get isEmpty(): boolean {
    return isEmpty(this.opts, this.#data);
  }

  get isFull(): boolean {
    return isFull(this.opts, this.#data);
  }

  get length(): number {
    return this.#data.length;
  }

  get peek(): V | undefined {
    return peek(this.opts, this.#data);
  }

  toArray() {
    return [ ...this.#data ];
  }
}

/**
 * Returns an immutable queue. Queues are useful if you want to treat 'older' or 'newer'
 * items differently. _Enqueing_ adds items at the back of the queue, while
 * _dequeing_ removes items from the front (ie. the oldest).
 *
 * ```js
 * let q = Queues.immutable();           // Create
 * q = q.enqueue(`a`, `b`);   // Add two strings
 * const front = q.peek();    // `a` is at the front of queue (oldest)
 * q = q.dequeue();           // q now just consists of `b`
 * ```
 * @example Cap size to 5 items, throwing away newest items already in queue.
 * ```js
 * const q = Queues.immutable({capacity: 5, discardPolicy: `newer`});
 * ```
 *
 * @typeParam V - Type of values stored
 * @param options
 * @param startingItems Index 0 is the front of the queue
 * @returns A new queue
 */
export const immutable = <V>(
  options: QueueOpts<V> = {},
  ...startingItems: readonly V[]
): IQueueImmutable<V> => {
  options = { ...options }; // Make a copy of options
  return new QueueImmutable(options, [ ...startingItems ]); // Make a copy of array so it can't be modified
};
