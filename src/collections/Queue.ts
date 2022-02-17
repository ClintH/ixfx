// ✔ UNIT TESTED

import {QueueMutable, Queue, DiscardPolicy} from "./Interfaces.js";

/**
 * Queue options.
 * 
 * @example Cap size to 5 items, throwing away newest items already in queue.
 * ```js
 * const q = queue({capacity: 5, discardPolicy: `newer`});
 * ```
 */
export type QueueOpts =  {
  /**
   * @private
   */
  readonly debug?:boolean
  /**
   * Capcity limit
   */
  readonly capacity?: number
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
  readonly discardPolicy?: DiscardPolicy
}

const debug = (opts: QueueOpts, msg:string):void => {
  /* eslint-disable-next-line functional/no-expression-statement */
  opts.debug ? console.log(`queue:${msg}`) : null;
};

const trimQueue = <V>(opts: QueueOpts, queue: ReadonlyArray<V>, toAdd: ReadonlyArray<V>): ReadonlyArray<V> => {
  const potentialLength = queue.length + toAdd.length;
  const capacity = opts.capacity ?? potentialLength;
  const toRemove = potentialLength - capacity;
  const policy = opts.discardPolicy ?? `additions`;
  debug(opts, `queueLen: ${queue.length} potentialLen: ${potentialLength} toRemove: ${toRemove} policy: ${policy}`);
 
  switch (policy) {
  // Only add what we can from toAdd
  case `additions`:
    debug(opts, `trimQueue:DiscardAdditions: queueLen: ${queue.length} slice: ${potentialLength-capacity} toAddLen: ${toAdd.length}`);
    if (queue.length === opts.capacity) {
      return queue; // Completely full
    } else {
      // Only add some from the new array (from the front)  
      return [...queue, ...toAdd.slice(0, toRemove-1)];
    }
  // Remove from rear of queue (last index) before adding new things
  case `newer`:
    if (toRemove >= queue.length) {
      // New items will completely flush out old
      return toAdd.slice(Math.max(0, toAdd.length-capacity), Math.min(toAdd.length, capacity)+1);
    } else {
      // Keep some of the old
      const toAddFinal = toAdd.slice(0, Math.min(toAdd.length, capacity-toRemove+1));
      const toKeep =  queue.slice(0, queue.length-toRemove);
      debug(opts, `trimQueue: toRemove: ${toRemove} keeping: ${JSON.stringify(toKeep)} from orig: ${JSON.stringify(queue)} toAddFinal: ${JSON.stringify(toAddFinal)}`);
      const t=  [...toKeep, ...toAddFinal];    
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
const enqueue = <V>(opts: QueueOpts, queue: ReadonlyArray<V>, ...toAdd: ReadonlyArray<V>): ReadonlyArray<V> => {
  if (opts === undefined) throw new Error(`opts parameter undefined`);

  const potentialLength = queue.length + toAdd.length;
  const overSize = opts.capacity && potentialLength > opts.capacity;

  const toReturn = overSize ? trimQueue(opts, queue, toAdd) : [...queue, ...toAdd];
  if (opts.capacity && toReturn.length !== opts.capacity && overSize) throw new Error(`Bug! Expected return to be at capacity. Return len: ${toReturn.length} capacity: ${opts.capacity} opts: ${JSON.stringify(opts)}`);
  if (!opts.capacity && toReturn.length !== potentialLength) throw new Error(`Bug! Return length not expected. Return len: ${toReturn.length} expected: ${potentialLength} opts: ${JSON.stringify(opts)}`);
  
  return toReturn;
};

// Remove from front of queue (0 index)
const dequeue = <V>(opts: QueueOpts, queue: ReadonlyArray<V>): ReadonlyArray<V> => {
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
const peek = <V>(opts: QueueOpts, queue: ReadonlyArray<V>): V | undefined => queue[0];

const isEmpty = <V>(opts: QueueOpts, queue: ReadonlyArray<V>): boolean => queue.length === 0;

const isFull = <V>(opts: QueueOpts, queue: ReadonlyArray<V>): boolean => {
  if (opts.capacity) {
    return queue.length >= opts.capacity;
  }
  return false;
};

// -------------------------------
// Immutable
// -------------------------------
class QueueImpl<V> {
  readonly opts: QueueOpts;
  readonly data: ReadonlyArray<V>;

  /**
   * Creates an instance of Queue.
   * @param {QueueOpts} opts Options foor queue
   * @param {V[]} data Initial data. Index 0 is front of queue
   * @memberof Queue
   */
  constructor(opts: QueueOpts, data: ReadonlyArray<V>) {
    if (opts === undefined) throw new Error(`opts parameter undefined`);

    this.opts = opts;
    this.data = data;
  }

  forEach(fn:(v:V) => void) {
    //eslint-disable-next-line functional/no-loop-statement,functional/no-let
    for (let i=this.data.length-1; i>=0; i--) {
      fn(this.data[i]);
    }  
  }

  forEachFromFront(fn:(v:V) => void) {
    // From front of queue
    this.data.forEach(vv => fn(vv));
  }

  enqueue(...toAdd: ReadonlyArray<V>): QueueImpl<V> {
    return new QueueImpl<V>(this.opts, enqueue(this.opts, this.data, ...toAdd));
  }

  dequeue(): QueueImpl<V> {
    return new QueueImpl<V>(this.opts, dequeue(this.opts, this.data));
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

  get peek(): V | undefined {
    return peek(this.opts, this.data);
  }
}

// -------------------------------
// Mutable
// -------------------------------
class QueueMutableImpl<V> implements QueueMutable<V> {
  readonly opts: QueueOpts;
  // eslint-disable-next-line functional/prefer-readonly-type
  data: ReadonlyArray<V>;

  constructor(opts:QueueOpts, data:ReadonlyArray<V>) {
    if (opts === undefined) throw new Error(`opts parameter undefined`);
    this.opts = opts;
    this.data = data;
  }

  enqueue(...toAdd: ReadonlyArray<V>): number {
    /* eslint-disable-next-line functional/immutable-data */
    this.data = enqueue(this.opts, this.data, ...toAdd);
    return this.data.length;
  }

  dequeue(): V|undefined {
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

  get length():number {
    return this.data.length;
  }

  get peek(): V | undefined {
    return peek(this.opts, this.data);
  }
}

/**
 * Returns an immutable queue. Queues are useful if you want to treat 'older' or 'newer'
 * items differently. _Enqueing_ adds items at the back of the queue, while
 * _dequeing_ removes items from the front (ie. the oldest).
 *
 * ```js
 * let q = queue();           // Create
 * q = q.enqueue(`a`, `b`);   // Add two strings
 * const front = q.peek();    // `a` is at the front of queue (oldest)
 * q = q.dequeue();           // q now just consists of `b`  
 * ```
 * @example Cap size to 5 items, throwing away newest items already in queue.
 * ```js
 * const q = queue({capacity: 5, discardPolicy: `newer`});
 * ```
 * 
 * @template V Data type of items
 * @param opts
 * @param startingItems Index 0 is the front of the queue
 * @returns A new queue
 */
export const queue = <V>(opts: QueueOpts = {}, ...startingItems: ReadonlyArray<V>): Queue<V> => {
  opts = {...opts}; // Make a copy of options
  return new QueueImpl(opts, [...startingItems]); // Make a copy of array so it can't be modified
};

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
export const queueMutable = <V>(opts: QueueOpts = {}, ...startingItems: ReadonlyArray<V>): QueueMutable<V> => new QueueMutableImpl({...opts}, [...startingItems]);