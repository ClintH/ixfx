import type { QueueOpts } from './queue-types.js';

export function debug(opts: QueueOpts<any>, message: string): void {
  if (opts.debug)
    console.log(`queue:${message}`);
}

export function trimQueue<V>(opts: QueueOpts<V>, queue: readonly V[], toAdd: readonly V[]): readonly V[] {
  const potentialLength = queue.length + toAdd.length;
  const capacity = opts.capacity ?? potentialLength;
  const toRemove = potentialLength - capacity;
  const policy = opts.discardPolicy ?? `additions`;
  // debug(
  //   opts,
  //   `queueLen: ${queue.length} potentialLen: ${potentialLength} toRemove: ${toRemove} policy: ${policy} toAdd.length: ${toAdd.length} capacity: ${capacity}`
  // );
  // debug(opts, `to add: ${JSON.stringify(toAdd)}`);

  switch (policy) {
    // Only add what we can from toAdd (from the front)
    case `additions`: {
      if (queue.length >= capacity)
        return queue; // Completely full
      return [...queue, ...toAdd.slice(0, capacity - queue.length)];
    }
    // Discard newest items already in queue to make room. Same result as
    // enqueuing toAdd one at a time: once full, each addition replaces the last item.
    // ie. keep the first (capacity-1) of queue+toAdd, then the very last item of toAdd
    case `newer`: {
      const keep = Math.min(queue.length, capacity - 1);
      const fromAdd = capacity - 1 - keep;

      return [...queue.slice(0, keep), ...toAdd.slice(0, fromAdd), toAdd.at(-1)!];
    }
    // Remove from the front of the queue (0 index). ie. older items are discarded
    case `older`: {
      // If queue is A, B and toAdd is C, D this yields A, B, C, D, then trims from the front
      if (toRemove >= queue.length)
        return toAdd.slice(toRemove - queue.length);
      return [...queue.slice(toRemove), ...toAdd];
    }
    default: {
      throw new Error(`Unknown overflow policy ${policy}`);
    }
  }
}

/**
 * Adds to the back of the queue (last array index)
 * Last item of `toAdd` will potentially be the new end of the queue (depending on capacity limit and overflow policy)
 * @typeParam V - Type of values
 * @param {QueueOpts} opts
 * @param {V[]} queue
 * @param {...V[]} toAdd
 * @returns {V[]}
 */
export function enqueue<V>(opts: QueueOpts<V>, queue: readonly V[], ...toAdd: readonly V[]): readonly V[] {
  if (opts === undefined)
    throw new Error(`opts parameter undefined`);
  if (toAdd.length === 0)
    return queue;

  const potentialLength = queue.length + toAdd.length;
  const overSize = opts.capacity && potentialLength > opts.capacity;

  const toReturn = overSize
    ? trimQueue(opts, queue, toAdd)
    : [...queue, ...toAdd];
  if (opts.capacity && toReturn.length !== opts.capacity && overSize) {
    throw new Error(
      `Bug! Expected return to be at capacity. Return len: ${toReturn.length
      } capacity: ${opts.capacity} opts: ${JSON.stringify(opts)}`,
    );
  }
  if (!opts.capacity && toReturn.length !== potentialLength) {
    throw new Error(
      `Bug! Return length not expected. Return len: ${toReturn.length
      } expected: ${potentialLength} opts: ${JSON.stringify(opts)}`,
    );
  }
  return toReturn;
}

// Remove from front of queue (0 index)
export function dequeue<V>(opts: QueueOpts<V>, queue: readonly V[]): readonly V[] {
  if (queue.length === 0)
    throw new Error(`Queue is empty`);
  return queue.slice(1);
}

/**
 * Returns front of queue (oldest item), or undefined if queue is empty
 *
 * @typeParam V - Type of values stored
 * @param {QueueOpts} opts
 * @param {V[]} queue
 * @returns {(V | undefined)}
 */
export function peek<V>(opts: QueueOpts<V>, queue: readonly V[]): V | undefined {
  return queue[0];
}

export function isEmpty<V>(opts: QueueOpts<V>, queue: readonly V[]): boolean {
  return queue.length === 0;
}

export function isFull<V>(opts: QueueOpts<V>, queue: readonly V[]): boolean {
  if (opts.capacity) {
    return queue.length >= opts.capacity;
  }
  return false;
}
