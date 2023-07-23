import type { QueueOpts } from './index.js';

export const debug = (opts: QueueOpts, msg: string): void => {
  /* eslint-disable-next-line functional/no-expression-statements */
  opts.debug ? console.log(`queue:${msg}`) : null;
};

export const trimQueue = <V>(
  opts: QueueOpts,
  queue: ReadonlyArray<V>,
  toAdd: ReadonlyArray<V>
): ReadonlyArray<V> => {
  const potentialLength = queue.length + toAdd.length;
  const capacity = opts.capacity ?? potentialLength;
  const toRemove = potentialLength - capacity;
  const policy = opts.discardPolicy ?? `additions`;
  debug(
    opts,
    `queueLen: ${queue.length} potentialLen: ${potentialLength} toRemove: ${toRemove} policy: ${policy}`
  );

  switch (policy) {
    // Only add what we can from toAdd
    case `additions`:
      debug(
        opts,
        `trimQueue:DiscardAdditions: queueLen: ${queue.length} slice: ${
          potentialLength - capacity
        } toAddLen: ${toAdd.length}`
      );
      if (queue.length === opts.capacity) {
        return queue; // Completely full
      } else {
        // Only add some from the new array (from the front)
        return [...queue, ...toAdd.slice(0, toRemove - 1)];
      }
    // Remove from rear of queue (last index) before adding new things
    case `newer`:
      if (toRemove >= queue.length) {
        // New items will completely flush out old
        return toAdd.slice(
          Math.max(0, toAdd.length - capacity),
          Math.min(toAdd.length, capacity) + 1
        );
      } else {
        // Keep some of the old
        const toAddFinal = toAdd.slice(
          0,
          Math.min(toAdd.length, capacity - toRemove + 1)
        );
        const toKeep = queue.slice(0, queue.length - toRemove);
        debug(
          opts,
          `trimQueue: toRemove: ${toRemove} keeping: ${JSON.stringify(
            toKeep
          )} from orig: ${JSON.stringify(queue)} toAddFinal: ${JSON.stringify(
            toAddFinal
          )}`
        );
        const t = [...toKeep, ...toAddFinal];
        debug(opts, `final: ${JSON.stringify(t)}`);
        return t;
      }
    // Remove from the front of the queue (0 index). ie. older items are discarded
    case `older`:
      // If queue is A, B and toAdd is C, D this yields A, B, C, D
      return [...queue, ...toAdd].slice(toRemove);
    default:
      throw new Error(`Unknown overflow policy ${policy}`);
  }
};

/**
 * Adds to the back of the queue (last array index)
 * Last item of `toAdd` will potentially be the new end of the queue (depending on capacity limit and overflow policy)
 * @template V
 * @param {QueueOpts} opts
 * @param {V[]} queue
 * @param {...V[]} toAdd
 * @returns {V[]}
 */
export const enqueue = <V>(
  opts: QueueOpts,
  queue: ReadonlyArray<V>,
  ...toAdd: ReadonlyArray<V>
): ReadonlyArray<V> => {
  if (opts === undefined) throw new Error(`opts parameter undefined`);

  const potentialLength = queue.length + toAdd.length;
  const overSize = opts.capacity && potentialLength > opts.capacity;

  const toReturn = overSize
    ? trimQueue(opts, queue, toAdd)
    : [...queue, ...toAdd];
  if (opts.capacity && toReturn.length !== opts.capacity && overSize) {
    throw new Error(
      `Bug! Expected return to be at capacity. Return len: ${
        toReturn.length
      } capacity: ${opts.capacity} opts: ${JSON.stringify(opts)}`
    );
  }
  if (!opts.capacity && toReturn.length !== potentialLength) {
    throw new Error(
      `Bug! Return length not expected. Return len: ${
        toReturn.length
      } expected: ${potentialLength} opts: ${JSON.stringify(opts)}`
    );
  }
  return toReturn;
};

// Remove from front of queue (0 index)
export const dequeue = <V>(
  opts: QueueOpts,
  queue: ReadonlyArray<V>
): ReadonlyArray<V> => {
  if (queue.length === 0) throw new Error(`Queue is empty`);
  return queue.slice(1);
};

/**
 * Returns front of queue (oldest item), or undefined if queue is empty
 *
 * @template V
 * @param {QueueOpts} opts
 * @param {V[]} queue
 * @returns {(V | undefined)}
 */
export const peek = <V>(
  opts: QueueOpts,
  queue: ReadonlyArray<V>
): V | undefined => queue[0];

export const isEmpty = <V>(opts: QueueOpts, queue: ReadonlyArray<V>): boolean =>
  queue.length === 0;

export const isFull = <V>(
  opts: QueueOpts,
  queue: ReadonlyArray<V>
): boolean => {
  if (opts.capacity) {
    return queue.length >= opts.capacity;
  }
  return false;
};
