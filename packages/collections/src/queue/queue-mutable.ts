import { type IQueueMutable, type IQueueMutableWithEvents, type QueueMutableEvents } from './iqueue-mutable.js';
import { enqueue, peek, dequeue, isEmpty, isFull } from './queue-fns.js';
import { type QueueOpts } from './queue-types.js';
import { isEqualDefault, type IsEqual } from '@ixfx/core';
import { SimpleEventEmitter } from '@ixfx/events'; //'../../Events.js';

/**
 * Mutable queue that fires events when manipulated.
 * 
 * Queues are useful if you want to treat 'older' or 'newer'
 * items differently. _Enqueing_ adds items at the back of the queue, while
 * _dequeing_ removes items from the front (ie. the oldest).
 *
 * ```js
 * const q = Queues.mutable();       // Create
 * q.enqueue(`a`, `b`);     // Add two strings
 * const front = q.dequeue();  // `a` is at the front of queue (oldest)
 * ```
 *
 * @example Cap size to 5 items, throwing away newest items already in queue.
 * ```js
 * const q = Queues.mutable({capacity: 5, discardPolicy: `newer`});
 * ```
 *
 * Events can be used to monitor data flows.
 * * 'enqueue': fires when item(s) are added
 * * 'dequeue': fires when an item is dequeued from front
 * * 'removed': fires when an item is dequeued, queue is cleared or .removeWhere is used to trim queue
 * 
 * Each of the event handlers return the state of the queue as the 'finalData'
 * field.
 * 
 * ```js
 * q.addEventListener(`enqueue`, e => {
 *  // e.added, e.finalData
 * });
 * q.addEventListener(`removed`, e => {
 *  // e.removed, e.finalData
 * });
 * q.addEventListener(`dequeue`, e=> {
 *  // e.removed, e.finalData
 * })
 * ```
 * @typeParam V - Data type of items
 */
export class QueueMutable<V> extends SimpleEventEmitter<QueueMutableEvents<V>> implements IQueueMutable<V> {
  readonly options: QueueOpts<V>;
  data: readonly V[];
  eq: IsEqual<V>;

  constructor(opts: QueueOpts<V> = {}, data: readonly V[] = []) {
    super();
    if (opts === undefined) throw new Error(`opts parameter undefined`);
    this.options = opts;
    this.data = data;
    this.eq = opts.eq ?? isEqualDefault;
  }

  clear(): void {
    const copy = [ ...this.data ];
    this.data = [];
    this.fireEvent(`removed`, { finalData: this.data, removed: copy });
    this.onClear();
  }

  /**
   * Called when all data is cleared
   */
  protected onClear(): void { /** no-op */
  }

  at(index: number): V {
    if (index >= this.data.length) throw new Error(`Index outside bounds of queue`);
    const v = this.data.at(index);
    if (v === undefined) throw new Error(`Index appears to be outside range of queue`);
    return v;
  }

  enqueue(...toAdd: readonly V[]): number {
    this.data = enqueue(this.options, this.data, ...toAdd);
    const length = this.data.length;
    this.onEnqueue(this.data, toAdd);
    return length;
  }

  protected onEnqueue(result: readonly V[], attemptedToAdd: readonly V[]): void {
    this.fireEvent(`enqueue`, { added: attemptedToAdd, finalData: result });
  }

  dequeue(): V | undefined {
    const v = peek(this.options, this.data);
    if (v === undefined) return;
    /* eslint-disable-next-line functional/immutable-data */
    this.data = dequeue(this.options, this.data);
    this.fireEvent(`dequeue`, { removed: v, finalData: this.data });
    this.onRemoved([ v ], this.data);
    return v;
  }

  protected onRemoved(removed: readonly V[], finalData: readonly V[]): void {
    this.fireEvent(`removed`, { removed, finalData });
  }

  /**
   * Removes values that match `predicate`.
   * @param predicate 
   * @returns Returns number of items removed.
   */
  removeWhere(predicate: (item: V) => boolean): number {
    const countPre = this.data.length;
    const toRemove = this.data.filter(v => predicate(v));
    if (toRemove.length === 0) return 0;
    this.data = this.data.filter((element) => !predicate(element));
    this.onRemoved(toRemove, this.data);
    return countPre - this.data.length;
  }

  /**
 * Return a copy of the array
 * @returns 
 */
  toArray(): V[] {
    return [ ...this.data ];
  }

  get isEmpty(): boolean {
    return isEmpty(this.options, this.data);
  }

  get isFull(): boolean {
    return isFull(this.options, this.data);
  }

  get length(): number {
    return this.data.length;
  }

  get peek(): V | undefined {
    return peek(this.options, this.data);
  }
}

/**
 * Creates a new QueueMutable
 * @param options 
 * @param startingItems 
 * @returns 
 */
export function mutable<V>(
  options: QueueOpts<V> = {},
  ...startingItems: readonly V[]
): IQueueMutableWithEvents<V> {
  return new QueueMutable({ ...options }, [ ...startingItems ]);
}

