import { type IQueueMutable } from './IQueueMutable.js';
import { enqueue, peek, dequeue, isEmpty, isFull } from './QueueFns.js';
import { type QueueOpts } from './index.js';

export class QueueMutableImpl<V> implements IQueueMutable<V> {
  readonly opts: QueueOpts;
  // eslint-disable-next-line functional/prefer-readonly-type
  data: ReadonlyArray<V>;

  constructor(opts: QueueOpts, data: ReadonlyArray<V>) {
    if (opts === undefined) throw new Error(`opts parameter undefined`);
    this.opts = opts;
    this.data = data;
  }

  enqueue(...toAdd: ReadonlyArray<V>): number {
    /* eslint-disable-next-line functional/immutable-data */
    this.data = enqueue(this.opts, this.data, ...toAdd);
    return this.data.length;
  }

  dequeue(): V | undefined {
    const v = peek(this.opts, this.data);
    /* eslint-disable-next-line functional/immutable-data */
    this.data = dequeue(this.opts, this.data);
    return v;
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

/**
 * Returns a mutable queue. Queues are useful if you want to treat 'older' or 'newer'
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
 * @template V Data type of items
 * @param opts
 * @param startingItems Items are added in array order. So first item will be at the front of the queue.
 */
export function queueMutable<V>(
  opts: QueueOpts = {},
  ...startingItems: ReadonlyArray<V>
): IQueueMutable<V> {
  return new QueueMutableImpl({ ...opts }, [...startingItems]);
}
