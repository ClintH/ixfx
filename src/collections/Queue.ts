// ✔ UNIT TESTED


export enum OverflowPolicy {
  /**
   * Removes items front of the queue (ie older items are discarded)
   */
  DiscardOlder,
  /**
   * Remove from rear of queue to make space for new items (ie newer items are discarded)
   */
  DiscardNewer,
  /**
   * Only adds new items that there are room for (ie. brand new items are discarded)
   */
  DiscardAdditions
}


export type QueueOpts = {
  debug?:boolean
  capacity?: number
  /**
   * Default is DiscardAdditions, meaning new items are discarded
   *
   * @type {OverflowPolicy}
   */
  overflowPolicy?: OverflowPolicy
}

/**
 * Adds to the back of the queue (last array index)
 * Last item of `toAdd` will potentially be the new end of the queue (depending on capacity limit and overflow policy)
 * @template V
 * @param {QueueOpts} opts
 * @param {V[]} queue
 * @param {...V[]} toAdd
 * @returns {V[]}
 */
const enqueue = <V>(opts: QueueOpts, queue: V[], ...toAdd: V[]): V[] => {
  const potentialLength = queue.length + toAdd.length;
  if (opts.capacity && potentialLength > opts.capacity) {
    const toRemove = potentialLength - opts.capacity;
    const policy = opts.overflowPolicy ?? OverflowPolicy.DiscardAdditions;
    if (opts.debug) console.log(`enqueue: queueLen: ${queue.length} potentialLen: ${potentialLength} toRemove: ${toRemove} policy: ${OverflowPolicy[policy]}`);
    let toReturn:V[];

    switch (policy) {
    // Only add what we can from toAdd
    case OverflowPolicy.DiscardAdditions:
      if (opts.debug) console.log(`enqueue:DiscardAdditions: queueLen: ${queue.length} slice: ${potentialLength-opts.capacity} toAddLen: ${toAdd.length}`);
      if (queue.length === opts.capacity) {
        toReturn = queue; // Completely full
      } else {
        // Only add some from the new array (from the front)  
        toReturn = [...queue, ...toAdd.slice(0, toRemove-1)];
        //return [...queue, ...toAdd.slice(0, potentialLength-toAdd.length)];
      }
      break;
    // Remove from rear of queue (last index) before adding new things
    case OverflowPolicy.DiscardNewer:
      if (toRemove >= queue.length) {
        // New items will completely flush out old
        toReturn = toAdd.slice(Math.max(0, toAdd.length-opts.capacity), Math.min(toAdd.length, opts.capacity)+1);
      } else {
        // Keep some of the old
        if (opts.debug) console.log(` from orig: ${queue.slice(0, toRemove-1)}`);
        toReturn = [...queue.slice(0, toRemove-1), ...toAdd.slice(0, Math.min(toAdd.length, opts.capacity-toRemove+1))];    
      }
      break;
    // Remove from the front of the queue (0 index). ie. older items are discarded
    case OverflowPolicy.DiscardOlder:
      // If queue is A, B and toAdd is C, D this yields A, B, C, D
      toReturn = [...queue, ...toAdd].slice(toRemove);
      break;
    default:
      throw new Error(`Unknown overflow policy ${policy}`);
    }

    if (toReturn.length !== opts.capacity) throw new Error(`Bug! Expected return to be at capacity. Return len: ${toReturn.length} capacity: ${opts.capacity}`);
    return toReturn;
  } else {
    return [...queue, ...toAdd];
  }
};

// Remove from front of queue (0 index)
const dequeue = <V>(opts: QueueOpts, queue: V[]): V[] => {
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
const peek = <V>(opts: QueueOpts, queue: V[]): V | undefined => queue.at(0);

const isEmpty = <V>(opts: QueueOpts, queue: V[]): boolean => queue.length === 0;

const isFull = <V>(opts: QueueOpts, queue: V[]): boolean => {
  if (opts.capacity) {
    return queue.length >= opts.capacity;
  }
  return false;
};

// -------------------------------
// Immutable
// -------------------------------
class Queue<V> {
  readonly opts: QueueOpts;
  readonly data: V[];

  /**
   * Creates an instance of Queue.
   * @param {QueueOpts} opts Options foor queue
   * @param {V[]} data Initial data. Index 0 is front of queue
   * @memberof Queue
   */
  constructor(opts: QueueOpts, data: V[]) {
    this.opts = opts;
    this.data = data;
  }

  enqueue(...toAdd: V[]): Queue<V> {
    return new Queue<V>(this.opts, enqueue(this.opts, this.data, ...toAdd));
  }

  dequeue(): Queue<V> {
    return new Queue<V>(this.opts, dequeue(this.opts, this.data));
  }

  get isEmpty(): boolean {
    return isEmpty(this.opts, this.data);
  }

  get isFull(): boolean {
    return isFull(this.opts, this.data);
  }

  get length():number {
    return this.data.length;
  }

  /**
   * Returns front of queue (oldest item), or undefined if queue is empty
   *
   * @readonly
   * @type {(V | undefined)}
   * @memberof Queue
   */
  get peek(): V | undefined {
    return peek(this.opts, this.data);
  }
}

/**
 * Returns an immutable queue
 *
 * @template V
 * @param {QueueOpts} [opts={}] Options
 * @param {...V[]} startingItems Index 0 is the front of the queue
 * @returns {Queue<V>} A new queue
 */
export const queue = <V>(opts: QueueOpts = {}, ...startingItems: V[]): Queue<V> => {
  opts = {...opts}; // Make a copy of options
  return new Queue(opts, [...startingItems]); // Make a copy of array so it can't be modified
};

// -------------------------------
// Mutable
// -------------------------------
class MutableQueue<V> {
  opts: QueueOpts;
  data: V[];

  constructor(opts:QueueOpts, data:V[]) {
    this.opts = opts;
    this.data = data;
  }

  enqueue(...toAdd: V[]): number {
    this.data = enqueue(this.opts, this.data, ...toAdd);
    return this.data.length;
  }

  dequeue(): V|undefined {
    const v = peek(this.opts, this.data);
    this.data = dequeue(this.opts, this.data);
    return v;
  }

  get isEmpty(): boolean {
    return isEmpty(this.opts, this.data);
  }

  get isFull(): boolean {
    return isFull(this.opts, this.data);
  }

  get length():number {
    return this.data.length;
  }

  /**
   * Returns front of queue (oldest item), or undefined if queue is empty
   *
   * @readonly
   * @type {(V | undefined)}
   * @memberof Queue
   */
  get peek(): V | undefined {
    return peek(this.opts, this.data);
  }
}

export const queueMutable = <V>(opts: QueueOpts = {}, ...startingItems: V[]) => new MutableQueue({...opts}, [...startingItems]);