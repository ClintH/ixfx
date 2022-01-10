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

export type StackOpts = {
  debug?:boolean
  capacity?: number
  overflowPolicy?: OverflowPolicy
}

// Add to top (last index)
const push = <V>(opts: StackOpts, stack: V[], ...toAdd: V[]): V[] => {
  // If stack is A, B and toAdd is C, D this yields A, B, C, D
  //const mutated = [...stack, ...toAdd];
  const potentialLength = stack.length + toAdd.length;

  if (opts.capacity && potentialLength > opts.capacity) {
    const policy = opts.overflowPolicy ?? OverflowPolicy.DiscardAdditions;
    const toRemove = potentialLength - opts.capacity;
    if (opts.debug) console.log(`Stack.push: stackLen: ${stack.length} potentialLen: ${potentialLength} toRemove: ${toRemove} policy: ${OverflowPolicy[policy]}`);

    let toReturn:V[] = stack;
    switch (policy) {
    case OverflowPolicy.DiscardAdditions:
      if (opts.debug) console.log(`Stack.push:DiscardAdditions: stackLen: ${stack.length} slice: ${potentialLength-opts.capacity} toAddLen: ${toAdd.length}`);
      if (stack.length === opts.capacity) {
        toReturn = stack; // Completely full
      } else {
        // Only add some from the new array
        toReturn = [...stack, ...toAdd.slice(0, toAdd.length-toRemove)];
      }
      break;
    case OverflowPolicy.DiscardNewer:
      if (toRemove >= stack.length) {
        // New items will completely flush out old
        toReturn = toAdd.slice(Math.max(0, toAdd.length-opts.capacity), Math.min(toAdd.length, opts.capacity)+1);
      } else {
        // Keep some of the old (from 0)
        if (opts.debug) console.log(` from orig: ${stack.slice(0, toRemove-1)}`);
        toReturn = [...stack.slice(0, toRemove-1), ...toAdd.slice(0, Math.min(toAdd.length, opts.capacity-toRemove+1))];    
      }
      break;
    case OverflowPolicy.DiscardOlder:
      // Oldest item in stack is position 0
      toReturn = [...stack, ...toAdd].slice(toRemove);
      break;
    default:
      throw new Error(`Unknown overflow policy ${policy}`);
    }

    if (toReturn.length !== opts.capacity) throw new Error(`Bug! Expected return to be at capacity. Return len: ${toReturn.length} capacity: ${opts.capacity}`);
    return toReturn;

  } else {
    return [...stack, ...toAdd];
  }
};

// Remove from top (last index)
const pop = <V>(opts: StackOpts, stack: V[]): V[] => {
  if (stack.length === 0) throw new Error(`Stack is empty`);
  return stack.slice(0, stack.length - 1);
};

/**
 * Peek at the top of the stack (end of array)
 *
 * @template V
 * @param {StackOpts} opts
 * @param {V[]} stack
 * @returns {(V | undefined)}
 */
const peek = <V>(opts: StackOpts, stack: V[]): V | undefined => stack.at(stack.length - 1);

const isEmpty = <V>(opts: StackOpts, stack: V[]): boolean => stack.length === 0;

const isFull = <V>(opts: StackOpts, stack: V[]): boolean => {
  if (opts.capacity) {
    return stack.length >= opts.capacity;
  }
  return false;
};

// -------------------------
// Immutable
// -------------------------

/**
 * Immutable stack
 * `Push` & `pop` both return a new instance, the original is never modified.
 * 
 * Usage:
 * ```
 * push(item);  // Return a new stack with item(s) added
 * pop();       // Return a new stack with top-most item removed (ie. newest)
 * .peek;       // Return what is at the top of the stack or undefined if empty
 * .isEmpty/.isFull;
 * .length;     // How many items in stack
 * .data;       // Get the underlying array
 * ```
 * 
 * Example
 * ```
 * let sanga = new Stack();
 * sanga = sanga.push(`bread`, `tomato`, `cheese`);
 * sanga.peek;  // `cheese`
 * sanga = sanga.pop(); // removes `cheese`
 * sanga.peek;  // `tomato`
 * const sangaAlt = sanga.push(`lettuce`, `cheese`); // sanga stays [`bread`, `tomato`], while sangaAlt is [`bread`, `tomato`, `lettuce`, `cheese`]
 * ```
 *
 * Stack can also be created from the basis of an existing array. First index of array will be the bottom of the stack.
 * @class Stack
 * @template V
 */
export class Stack<V> {
  readonly opts: StackOpts;
  readonly data: V[];

  constructor(opts: StackOpts, data: V[]) {
    this.opts = opts;
    this.data = data;
  }

  push(...toAdd: V[]): Stack<V> {
    return new Stack<V>(this.opts, push(this.opts, this.data, ...toAdd));
  }

  pop(): Stack<V> {
    return new Stack<V>(this.opts, pop(this.opts, this.data));
  }

  get isEmpty(): boolean {
    return isEmpty(this.opts, this.data);
  }

  get isFull(): boolean {
    return isFull(this.opts, this.data);
  }

  get peek(): V | undefined {
    return peek(this.opts, this.data);
  }

  get length():number {
    return this.data.length;
  }
}
/**
 * Returns an immutable stack
 *
 * @template V
 * @param {StackOpts} [opts={}]
 * @param {...V[]} startingItems
 * @returns {Stack<V>}
 */
export const stack = <V>(opts: StackOpts = {}, ...startingItems: V[]): Stack<V> => new Stack({...opts}, [...startingItems]);


// -------------------------
// Mutable
// -------------------------


/**
 * Mutable stack
 * 
 * Usage:
 * ```
 * push(item); // Add one or more items to the top of the stack
 * pop(); // Removes and retiurns the item at the top of the stack (ie the newest thing)
 * .peek; // Return what is at the top of the stack or undefined if empty
 * .isEmpty/.isFull;
 * .length; // How many items in stack
 * .data; // Get the underlying array
 * ```
 * 
 * Example
 * ```
 * const sanga = new MutableStack();
 * sanga.push(`bread`, `tomato`, `cheese`);
 * sanga.peek;  // `cheese`
 * sanga.pop(); // removes `cheese`
 * sanga.peek;  // `tomato`
 * sanga.push(`lettuce`, `cheese`); // Stack is now [`bread`, `tomato`, `lettuce`, `cheese`]
 * ```
 *
 * Stack can also be created from the basis of an existing array. First index of array will be the bottom of the stack.
 * @class MutableStack
 * @template V
 */
class MutableStack<V> {
  opts: StackOpts;
  data: V[];

  constructor(opts: StackOpts, data: V[]) {
    this.opts = opts;
    this.data = data;
  }

  push(...toAdd: V[]): number {
    this.data = push(this.opts, this.data, ...toAdd);
    return this.data.length;
  }

  pop(): V|undefined {
    const v = peek(this.opts, this.data);
    pop(this.opts, this.data);
    return v;
  }

  get isEmpty(): boolean {
    return isEmpty(this.opts, this.data);
  }

  get isFull(): boolean {
    return isFull(this.opts, this.data);
  }

  get peek(): V | undefined {
    return peek(this.opts, this.data);
  }

  get length():number {
    return this.data.length;
  }
}

/**
 * Creates a mutable stack
 *
 * @template V
 * @param {StackOpts} opts
 * @param {...V[]} startingItems
 * @returns
 */
export const stackMutable = <V>(opts: StackOpts, ...startingItems: V[]) =>  new MutableStack({...opts}, [...startingItems]);