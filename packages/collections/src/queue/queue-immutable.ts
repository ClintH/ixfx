import type { IQueueImmutable } from './iqueue-immutable.js';
import type { QueueOpts } from './queue-types.js';
import { dequeue, enqueue, isEmpty, isFull, peek } from './queue-fns.js';

// -------------------------------
// Immutable
// -------------------------------
export class QueueImmutable<V> implements IQueueImmutable<V> {
  readonly opts: QueueOpts<V>;
  #data: readonly V[];

  /**
   * Creates an instance of Queue.
   * @param {QueueOpts} opts Options foor queue
   * @param {V[]} data Initial data. Index 0 is front of queue. It is copied, so later changes to it don't affect the queue.
   */
  constructor(opts: QueueOpts<V> = {}, data: readonly V[] = []) {
    if (opts === undefined)
      throw new Error(`opts parameter undefined`);

    this.opts = opts;
    this.#data = data.length === 0 ? [] : [...data];
  }

  /**
   * Wraps data without copying. Returns `this` if data is unchanged.
   * `data` must not be referenced elsewhere in a way that could change it.
   */
  #withData(data: readonly V[]): QueueImmutable<V> {
    if (data === this.#data)
      return this;
    const q = new QueueImmutable<V>(this.opts);
    q.#data = data;
    return q;
  }

  forEach(fn: (v: V) => void): void {
    for (let index = this.#data.length - 1; index >= 0; index--) {
      fn(this.#data[index]);
    }
  }

  forEachFromFront(fn: (v: V) => void): void {
    // From front of queue

    this.#data.forEach((item) => {
      fn(item);
    }); // (vv) => fn(vv));
  }

  enqueue(...toAdd: readonly V[] | V[]): QueueImmutable<V> {
    return this.#withData(enqueue(this.opts, this.#data, ...toAdd));
  }

  dequeue(): QueueImmutable<V> {
    return this.#withData(dequeue(this.opts, this.#data));
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

  toArray(): V[] {
    return [...this.#data];
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
export function immutable<V>(options: QueueOpts<V> = {}, ...startingItems: readonly V[]): IQueueImmutable<V> {
  // Copy options so they can't be changed later. Constructor copies startingItems.
  return new QueueImmutable({ ...options }, startingItems);
}
