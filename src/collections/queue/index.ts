export type QueueDiscardPolicy = `older` | `newer` | `additions`;

/**
 * Queue options.
 *
 * @example Cap size to 5 items, throwing away newest items already in queue.
 * ```js
 * const q = queue({capacity: 5, discardPolicy: `newer`});
 * ```
 */
export type QueueOpts = {
  /**
   * @private
   */
  readonly debug?: boolean;
  /**
   * Capcity limit
   */
  readonly capacity?: number;
  /**
   * Default is `additions`, meaning new items are discarded.
   *
   * `older`: Removes items front of the queue (ie older items are discarded)
   *
   * `newer`: Remove from rear of queue to make space for new items (ie newer items are discarded)
   *
   * `additions`: Only adds new items that there are room for (ie. brand new items are discarded)
   *
   */
  readonly discardPolicy?: QueueDiscardPolicy;
};

export { type IQueueMutable } from './IQueueMutable.js';
export { type IQueue } from './IQueue.js';
export { queue } from './Queue.js';
export { queueMutable } from './QueueMutable.js';
