import { type IQueueMutable } from './IQueueMutable.js';
import { enqueue, peek, dequeue, isEmpty, isFull } from './QueueFns.js';
import { type QueueOpts } from './QueueTypes.js';
import { without } from '../Arrays.js';
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
   * Remove item from queue, regardless of position.
   * Returns _true_ if something was removed.
   * @param v 
   */
  remove(v: V, comparer?: IsEqual<V>): boolean {
    const length = this.data.length;
    this.data = without(this.data, v, comparer ?? this.eq);
    return this.data.length !== length;
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

