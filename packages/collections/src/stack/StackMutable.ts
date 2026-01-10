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

  forEach(fn: (v: V) => void): void {
    this.data.forEach(fn);
  }

  forEachFromTop(fn: (v: V) => void): void {
    [ ...this.data ].reverse().forEach(fn);
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
