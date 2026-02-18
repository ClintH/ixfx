// -------------------------
// Mutable
// -------------------------

import type { IStackMutable } from './IStackMutable.js';
import { push, peek, pop, isEmpty, isFull } from './StackFns.js';
import type { StackOpts } from './types.js';

/**
 * Creates a stack. Mutable. Use {@link StackImmutable} for an immutable alternative.
 *
 * @example Basic usage
 * ```js
 * // Create
 * const s = new StackMutable();
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
export class StackMutable<V> implements IStackMutable<V> {
  readonly opts: StackOpts;
  data: readonly V[];

  /**
   * Create a new StackMutable.
   * 
   * @param opts Options
   * @param data Initial data to use
   */
  constructor(opts: StackOpts = {}, data: readonly V[] = []) {
    this.opts = opts;
    this.data = data;
  }

  /**
   * Push data onto the stack.
   * If `toAdd` is empty, nothing happens
   * @param toAdd Data to add
   * @returns Length of stack
   */
  push(...toAdd: readonly V[]): number {
    if (toAdd.length === 0) return this.data.length;
    this.data = push(this.opts, this.data, ...toAdd);
    return this.data.length;
  }

  /**
   * Iterate from bottom to top. Note that `forEachFromTop` iterates from top to bottom, so this is the reverse.
   * @param fn
   */
  forEach(fn: (v: V) => void): void {
    this.data.forEach(fn);
  }

  /**
   * Iterate from top to bottom. Note that `forEach` iterates from bottom to top, so this is the reverse.
   * @param fn 
   */
  forEachFromTop(fn: (v: V) => void): void {
    [ ...this.data ].reverse().forEach(fn);
  }

  /**
   * Pop the top-most item from the stack, and return it. If the stack is empty, returns _undefined_.
   * @returns 
   */
  pop(): V | undefined {
    const v = peek(this.opts, this.data);
    this.data = pop(this.opts, this.data);
    return v;
  }

  /**
   * Returns _true_ if the stack is empty, _false_ otherwise.
   */
  get isEmpty(): boolean {
    return isEmpty(this.opts, this.data);
  }

  /**
   * Returns _true_ if the stack is full, _false_ otherwise. Note that a stack is only full if a `maxSize` option was provided at construction time.
   */
  get isFull(): boolean {
    return isFull(this.opts, this.data);
  }
  
/**
 * Returns the top-most item on the stack, without modifying the stack. If the stack is empty, returns _undefined_.
 */
  get peek(): V | undefined {
    return peek(this.opts, this.data);
  }

  /**
   * Returns the number of items currently on the stack.
   */
  get length(): number {
    return this.data.length;
  }
}

/**
 * Creates a stack. Mutable. Use {@link Stacks.immutable} for an immutable alternative.
 *
 * @example Basic usage
 * ```js
 * // Create
 * const s = Stacks.mutable();
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
export const mutable = <V>(
  opts: StackOpts = {},
  ...startingItems: readonly V[]
): IStackMutable<V> => new StackMutable({ ...opts }, [ ...startingItems ]);
