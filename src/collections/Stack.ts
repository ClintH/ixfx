// ✔ Unit tested!
import {DiscardPolicy, Stack} from "./Interfaces.js";
import {StackMutable} from './Interfaces.js';

export type StackOpts = {
  readonly debug?:boolean
  readonly capacity?: number
  readonly discardPolicy?: DiscardPolicy
}

const trimStack = <V>(opts: StackOpts, stack: ReadonlyArray<V>, toAdd: ReadonlyArray<V>): ReadonlyArray<V> => {
  const potentialLength = stack.length + toAdd.length;
  const policy = opts.discardPolicy ?? `additions`;
  const capacity = opts.capacity ?? potentialLength;
  const toRemove = potentialLength - capacity;
  if (opts.debug) console.log(`Stack.push: stackLen: ${stack.length} potentialLen: ${potentialLength} toRemove: ${toRemove} policy: ${policy}`);

  switch (policy) {
  case `additions`:
    if (opts.debug) console.log(`Stack.push:DiscardAdditions: stackLen: ${stack.length} slice: ${potentialLength-capacity} toAddLen: ${toAdd.length}`);
    if (stack.length === opts.capacity) {
      return stack; // Completely full
    } else {
      // Only add some from the new array
      return [...stack, ...toAdd.slice(0, toAdd.length-toRemove)];
    }
  case `newer`:
    if (toRemove >= stack.length) {
      // New items will completely flush out old
      return toAdd.slice(Math.max(0, toAdd.length-capacity), Math.min(toAdd.length, capacity)+1);
    } else {
      // Keep some of the old (from 0)
      //if (opts.debug) console.log(` orig: ${JSON.stringify(stack)}`);
      if (opts.debug) console.log(` from orig: ${stack.slice(0, stack.length-toRemove)}`);
      return [...stack.slice(0, stack.length-toRemove), ...toAdd.slice(0, Math.min(toAdd.length, capacity-toRemove+1))];    
    }
  case `older`:
    // Oldest item in stack is position 0
    return [...stack, ...toAdd].slice(toRemove);
  default:
    throw new Error(`Unknown discard policy ${policy}`);
  }
};

// Add to top (last index)
const push = <V>(opts: StackOpts, stack: ReadonlyArray<V>, ...toAdd: ReadonlyArray<V>): ReadonlyArray<V> => {
  // If stack is A, B and toAdd is C, D this yields A, B, C, D
  //const mutated = [...stack, ...toAdd];
  const potentialLength = stack.length + toAdd.length;

  const overSize = (opts.capacity && potentialLength > opts.capacity);
  const toReturn  = overSize ? trimStack(opts, stack, toAdd) : [...stack, ...toAdd];
  return toReturn;
};

// Remove from top (last index)
const pop = <V>(opts: StackOpts, stack: ReadonlyArray<V>): ReadonlyArray<V> => {
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
const peek = <V>(opts: StackOpts, stack: ReadonlyArray<V>): V | undefined => stack[stack.length - 1];

const isEmpty = <V>(opts: StackOpts, stack: ReadonlyArray<V>): boolean => stack.length === 0;

const isFull = <V>(opts: StackOpts, stack: ReadonlyArray<V>): boolean => {
  if (opts.capacity) {
    return stack.length >= opts.capacity;
  }
  return false;
};

// -------------------------
// Immutable
// -------------------------
class StackImpl<V> {
  readonly opts: StackOpts;
  /* eslint-disable-next-line functional/prefer-readonly-type */
  readonly data: ReadonlyArray<V>;

  constructor(opts: StackOpts, data: ReadonlyArray<V>) {
    this.opts = opts;
    this.data = data;
  }

  push(...toAdd: ReadonlyArray<V>): Stack<V> {
    return new StackImpl<V>(this.opts, push(this.opts, this.data, ...toAdd));
  }

  pop(): Stack<V> {
    return new StackImpl<V>(this.opts, pop(this.opts, this.data));
  }

  forEach(fn:(v:V) => void): void {
    this.data.forEach(fn);
  }

  forEachFromTop(fn:(v:V) => void): void {
    [...this.data].reverse().forEach(fn);
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

// -------------------------
// Mutable
// -------------------------
class StackMutableImpl<V> {
  readonly opts: StackOpts;
  /* eslint-disable-next-line functional/prefer-readonly-type */
  data: ReadonlyArray<V>;

  constructor(opts: StackOpts, data: ReadonlyArray<V>) {
    this.opts = opts;
    this.data = data;
  }

  push(...toAdd: ReadonlyArray<V>): number {
    /* eslint-disable-next-line functional/immutable-data */
    this.data = push(this.opts, this.data, ...toAdd);
    return this.data.length;
  }

  forEach(fn:(v:V) => void): void {
    this.data.forEach(fn);
  }

  forEachFromTop(fn:(v:V) => void): void {
    [...this.data].reverse().forEach(fn);
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
 * Returns stack (immutable). Use {@link stackMutable} for a mutable one.
 * @example
 * ```js
 * let s = stack();
 * s = s.push(1, 2, 3, 4);
 * s.peek; // 4
 * s = s.pop();
 * s.peek; // 3
 * ```
 * @template V
 * @param {StackOpts} [opts={}]
 * @param {...V[]} startingItems
 * @returns {Stack<V>}
 */
export const stack = <V>(opts: StackOpts = {}, ...startingItems: ReadonlyArray<V>): Stack<V> => new StackImpl({...opts}, [...startingItems]);


/**
 * Creates a stack (mutable). Use {@link stack} for an immutable one.
 * 
 * @example
 * ```js
 * const s = stackMutable();
 * s.push(1, 2, 3, 4);
 * s.peek;  // 4
 * s.pop;   // 4
 * s.peek;  // 3
 * ```
 * @template V
 * @param {StackOpts} opts
 * @param {...V[]} startingItems
 * @returns
 */
export const stackMutable = <V>(opts: StackOpts = {}, ...startingItems: ReadonlyArray<V>):StackMutable<V> =>  new StackMutableImpl({...opts}, [...startingItems]);