/**
 * Queue (immutable). See also {@link ./QueueMutable.ts}.
 *
 * Queues are useful if you want to treat 'older' or 'newer'
 * items differently. _Enqueing_ adds items at the back of the queue, while
 * _dequeing_ removes items from the front (ie. the oldest).
 *
 * ```js
 * let q = queue();           // Create
 * q = q.enqueue(`a`, `b`);   // Add two strings
 * const front = q.peek;      // `a` is at the front of queue (oldest)
 * q = q.dequeue();           // q now just consists of `b`
 * ```
 * @example Cap size to 5 items, throwing away newest items already in queue.
 * ```js
 * const q = queue({capacity: 5, discardPolicy: `newer`});
 * ```
 *
 */
export interface IQueueImmutable<V> {
  /**
   * Enumerates queue from back-to-front
   *
   */
  forEach(fn: (v: V) => void): void;

  /**
   * Enumerates queue from front-to-back
   * @param fn
   */
  forEachFromFront(fn: (v: V) => void): void;

  /**
   * Returns a new queue with items added
   * @param toAdd Items to add
   */
  enqueue(...toAdd: ReadonlyArray<V>): IQueueImmutable<V>;

  /**
   * Dequeues (removes oldest item / item at front of queue).
   * Use {@link peek} to get item that will be removed.
   *
   * @returns Queue with item removed
   */
  dequeue(): IQueueImmutable<V>;

  /**
   * Returns true if queue is empty
   */
  get isEmpty(): boolean;

  /**
   * Is queue full? Returns _false_ if no capacity has been set
   */
  get isFull(): boolean;
  /**
   * Number of items in queue
   */
  get length(): number;

  /**
   * Returns front of queue (oldest item), or _undefined_ if queue is empty
   */
  get peek(): V | undefined;
  /**
   * Data in queue as an array
   */
  get data(): readonly V[];
}
