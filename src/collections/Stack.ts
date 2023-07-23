import { push, pop, isEmpty, isFull, peek } from './StackFns.js';

// ✔ Unit tested!
export type StackDiscardPolicy = `older` | `newer` | `additions`;

export type StackOpts = {
  readonly debug?: boolean;
  readonly capacity?: number;
  readonly discardPolicy?: StackDiscardPolicy;
};

/**
 * Stack (mutable)
 *
 * @example Overview
 * ```
 * stack.push(item); // Add one or more items to the top of the stack
 * stack.pop(); // Removes and retiurns the item at the top of the stack (ie the newest thing)
 * stack.peek; // Return what is at the top of the stack or undefined if empty
 * stack.isEmpty/.isFull;
 * stack.length; // How many items in stack
 * stack.data; // Get the underlying array
 * ```
 *
 * @example
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
 * @template V
 */
export interface StackMutable<V> extends StackBase<V> {
  /**
   * Add items to the 'top' of the stack.
   *
   * @param toAdd Items to add.
   * @returns How many items were added
   */
  push(...toAdd: ReadonlyArray<V>): number;

  /**
   * Remove and return item from the top of the stack, or _undefined_ if empty.
   * If you just want to find out what's at the top, use {@link peek}.
   */
  pop(): V | undefined;
}

/**
 * Stack (immutable)
 *
 * @example Overview
 * ```js
 * stack.push(item); // Return a new stack with item(s) added
 * stack.pop();      // Return a new stack with top-most item removed (ie. newest)
 * stack.peek;       // Return what is at the top of the stack or undefined if empty
 * stack.isEmpty;
 * stack.isFull;
 * stack.length;     // How many items in stack
 * stack.data;       // Get the underlying array
 * ```
 *
 * @example
 * ```js
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
export interface Stack<V> extends StackBase<V> {
  push(...toAdd: ReadonlyArray<V>): Stack<V>;
  pop(): Stack<V>;
}

export interface StackBase<V> {
  /**
   * Enumerates stack from bottom-to-top
   *
   */
  forEach(fn: (v: V) => void): void;

  /**
   * Enumerates stack from top-to-bottom
   * @param fn
   */
  forEachFromTop(fn: (v: V) => void): void;

  get data(): readonly V[];
  /**
   * _True_ if stack is empty
   */
  get isEmpty(): boolean;

  /**
   * _True_ if stack is at its capacity. _False_ if not, or if there is no capacity.
   */
  get isFull(): boolean;

  /**
   * Get the item at the top of the stack without removing it (like `pop` would do)
   * @returns Item at the top of the stack, or _undefined_ if empty.
   */
  get peek(): V | undefined;

  /**
   * Number of items in stack
   */
  get length(): number;
}

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

  forEach(fn: (v: V) => void): void {
    this.data.forEach(fn);
  }

  forEachFromTop(fn: (v: V) => void): void {
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

  get length(): number {
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

  forEach(fn: (v: V) => void): void {
    this.data.forEach(fn);
  }

  forEachFromTop(fn: (v: V) => void): void {
    [...this.data].reverse().forEach(fn);
  }

  pop(): V | undefined {
    const v = peek(this.opts, this.data);
    this.data = pop(this.opts, this.data);
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

  get length(): number {
    return this.data.length;
  }
}

/**
 * Returns a stack. Immutable. Use {@link stackMutable} for a mutable alternative.
 *
 * The basic usage is `push`/`pop` to add/remove, returning the modified stack. Use the
 * property `peek` to see what's on top.
 *
 * @example Basic usage
 * ```js
 * // Create
 * let s = stack();
 * // Add one or more items
 * s = s.push(1, 2, 3, 4);
 * // See what's at the top of the stack
 * s.peek;      // 4
 *
 * // Remove from the top of the stack, returning
 * // a new stack without item
 * s = s.pop();
 * s.peek;        // 3
 * ```
 * @param opts Options
 * @param startingItems List of items to add to stack. Items will be pushed 'left to right', ie array index 0 will be bottom of the stack.
 */
export const stack = <V>(
  opts: StackOpts = {},
  ...startingItems: ReadonlyArray<V>
): Stack<V> => new StackImpl({ ...opts }, [...startingItems]);

/**
 * Creates a stack. Mutable. Use {@link stack} for an immutable alternative.
 *
 * @example Basic usage
 * ```js
 * // Create
 * const s = stackMutable();
 * // Add one or more items
 * s.push(1, 2, 3, 4);
 *
 * // See what's on top
 * s.peek;  // 4
 *
 * // Remove the top-most, and return it
 * s.pop();   // 4
 *
 * // Now there's a new top-most element
 * s.peek;  // 3
 * ```
 */
export const stackMutable = <V>(
  opts: StackOpts = {},
  ...startingItems: ReadonlyArray<V>
): StackMutable<V> => new StackMutableImpl({ ...opts }, [...startingItems]);
