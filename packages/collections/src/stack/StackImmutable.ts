// -------------------------
// Immutable
// -------------------------
import type { IStackImmutable } from './IStackImmutable.js';
import type { StackOpts } from './types.js';
import { isEmpty, isFull, peek, pop, push } from './StackFns.js';

export class StackImmutable<V> implements IStackImmutable<V> {
  private readonly opts: StackOpts;
  #data: readonly V[];

  /**
   * Constructor
   * @param opts Options
   * @param data Initial data. Index 0 is bottom of stack. It is copied, so later changes to it don't affect the stack.
   */
  constructor(opts: StackOpts = {}, data: readonly V[] = []) {
    this.opts = opts;
    this.#data = data.length === 0 ? [] : [...data];
  }

  /**
   * Underlying data. Index 0 is bottom of stack.
   */
  get data(): readonly V[] {
    return this.#data;
  }

  /**
   * Wraps data without copying. Returns `this` if data is unchanged.
   */
  #withData(data: readonly V[]): StackImmutable<V> {
    if (data === this.#data)
      return this;
    const s = new StackImmutable<V>(this.opts);
    s.#data = data;
    return s;
  }

  push(...toAdd: readonly V[]): StackImmutable<V> {
    if (toAdd.length === 0)
      return this;
    return this.#withData(push(this.opts, this.#data, ...toAdd));
  }

  pop(): IStackImmutable<V> {
    return this.#withData(pop(this.opts, this.#data));
  }

  forEach(fn: (v: V) => void): void {
    this.#data.forEach(fn);
  }

  forEachFromTop(fn: (v: V) => void): void {
    for (let index = this.#data.length - 1; index >= 0; index--) {
      fn(this.#data[index]);
    }
  }

  get isEmpty(): boolean {
    return isEmpty(this.opts, this.#data);
  }

  get isFull(): boolean {
    return isFull(this.opts, this.#data);
  }

  get peek(): V | undefined {
    return peek(this.opts, this.#data);
  }

  get length(): number {
    return this.#data.length;
  }
}

/**
 * Returns a stack. Immutable. Use {@link Stacks.mutable} for a mutable alternative.
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
 * @param options Options
 * @param startingItems List of items to add to stack. Items will be pushed 'left to right', ie array index 0 will be bottom of the stack.
 */
export function immutable<V>(options: StackOpts = {}, ...startingItems: readonly V[]): IStackImmutable<V> {
  return new StackImmutable({ ...options }, startingItems);
} // Constructor copies startingItems
