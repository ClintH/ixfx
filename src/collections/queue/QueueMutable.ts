import { type IQueueMutable } from './IQueueMutable.js';
import { enqueue, peek, dequeue, isEmpty, isFull } from './QueueFns.js';
import { type QueueOpts } from './QueueTypes.js';
import { without } from '../arrays/index.js';
import { isEqualDefault, type IsEqual } from '../../IsEqual.js';
/**
 * Returns a mutable queue. Queues are useful if you want to treat 'older' or 'newer'
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
 * @template V Data type of items
 * @param opts
 * @param startingItems Items are added in array order. So first item will be at the front of the queue.
 */
export class QueueMutable<V> implements IQueueMutable<V> {
  readonly opts: QueueOpts<V>;
  // eslint-disable-next-line functional/prefer-readonly-type
  data: ReadonlyArray<V>;
  eq: IsEqual<V>;

  constructor(opts: QueueOpts<V> = {}, data: ReadonlyArray<V> = []) {
    if (opts === undefined) throw new Error(`opts parameter undefined`);
    this.opts = opts;
    this.data = data;
    this.eq = opts.eq ?? isEqualDefault;
  }

  clear() {
    this.data = [];
  }

  at(index: number): V {
    if (index >= this.data.length) throw new Error(`Index outside bounds of queue`);
    const v = this.data.at(index);
    if (v === undefined) throw new Error(`Index appears to be outside range of queue`);
    return v;
  }

  /**
   * Return a copy of the array
   * @returns 
   */
  toArray() {
    return [ ...this.data ];
  }

  enqueue(...toAdd: ReadonlyArray<V>): number {
    /* eslint-disable-next-line functional/immutable-data */
    this.data = enqueue(this.opts, this.data, ...toAdd);
    return this.data.length;
  }

  dequeue(): V | undefined {
    const v = peek(this.opts, this.data);
    if (v === undefined) return;
    /* eslint-disable-next-line functional/immutable-data */
    this.data = dequeue(this.opts, this.data);
    return v;
  }

  /**
   * Remove value from queue, regardless of position.
   * Returns _true_ if something was removed.
   * 
   * See also {@link removeWhere} to remove based on a predicate
   * @param value 
   */
  remove(value: V, comparer?: IsEqual<V>): boolean {
    const length = this.data.length;
    this.data = without(this.data, value, comparer ?? this.eq);
    return this.data.length !== length;
  }

  /**
   * Removes values that match `predicate`.
   * See also {@link remove} if to remove a value based on equality checking.
   * @param predicate 
   * @returns Returns number of items removed.
   */
  removeWhere(predicate: (item: V) => boolean) {
    const countPre = this.data.length;
    this.data = this.data.filter((element) => predicate(element));
    return countPre - this.data.length;
  }

  get isEmpty(): boolean {
    return isEmpty(this.opts, this.data);
  }

  get isFull(): boolean {
    return isFull(this.opts, this.data);
  }

  get length(): number {
    return this.data.length;
  }

  get peek(): V | undefined {
    return peek(this.opts, this.data);
  }
}

export function mutable<V>(
  opts: QueueOpts<V> = {},
  ...startingItems: ReadonlyArray<V>
): IQueueMutable<V> {
  return new QueueMutable({ ...opts }, [ ...startingItems ]);
}

