import type { IsEqual } from "../../IsEqual.js";
/**
 * Queue (mutable). See also {@link IQueueImmutable} for the immutable version.
 *
 * Queues are useful if you want to treat 'older' or 'newer'
 * items differently. _Enqueing_ adds items at the back of the queue, while
 * _dequeing_ removes items from the front (ie. the oldest).
 *
 * ```js
 * const q = queue();       // Create
 * q.enqueue(`a`, `b`);     // Add two strings
 * const front = q.dequeue();  // `a` is at the front of queue (oldest)
 * ```
 *
 * @example Cap size to 5 items, throwing away newest items already in queue.
 * ```js
 * const q = queue({capacity: 5, discardPolicy: `newer`});
 * ```
 *
 */


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface IQueueMutable<V> {
  /**
   * Returns true if queue is empty
   */
  get isEmpty(): boolean;
  /**
   * Dequeues (removes oldest item / item at front of queue)
   * @returns Item, or undefined if queue is empty
   */
  readonly dequeue: () => V | undefined;
  /**
   * Enqueues (adds items to back of queue).
   * If a capacity is set, not all items might be added.
   * @returns How many items were added
   */
  readonly enqueue: (...toAdd: ReadonlyArray<V>) => number;
  /**
   * Returns front of queue (oldest item), or _undefined_ if queue is empty
   */
  get peek(): V | undefined;
  /**
   * Number of items in queue
   */
  get length(): number;
  /**
   * Is queue full? Returns _false_ if no capacity has been set
   */
  get isFull(): boolean;
  /**
   * Data in queue as an array
   */
  get data(): ReadonlyArray<V>;

  /**
 * Removes values that match `predicate`.
 * See also {@link remove} if to remove a value based on equality checking.
 * @param predicate 
 * @returns Returns number of items removed.
 */
  removeWhere(predicate: (item: V) => boolean): number

  /**
   * Remove value from queue, regardless of position.
   * Returns _true_ if something was removed.
   * 
   * See also {@link removeWhere} to remove based on a predicate
   * @param value 
   */
  remove(value: V, comparer?: IsEqual<V>): boolean;

  at(index: number): V;
  clear(): void;
}
