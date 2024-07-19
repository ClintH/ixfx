// -------------------------
// Immutable
// -------------------------
import type { IStackImmutable } from './IStackImmutable.js';
import { push, pop, isEmpty, isFull, peek } from './StackFns.js';
import type { StackOpts } from './Types.js';

export class StackImmutable<V> implements IStackImmutable<V> {
  private readonly opts: StackOpts;
  /* eslint-disable-next-line functional/prefer-readonly-type */
  readonly data: ReadonlyArray<V>;

  constructor(opts: StackOpts = {}, data: ReadonlyArray<V> = []) {
    this.opts = opts;
    this.data = data;
  }

  push(...toAdd: ReadonlyArray<V>): StackImmutable<V> {
    return new StackImmutable<V>(
      this.opts,
      push(this.opts, this.data, ...toAdd)
    );
  }

  pop(): IStackImmutable<V> {
    return new StackImmutable<V>(this.opts, pop(this.opts, this.data));
  }

  forEach(fn: (v: V) => void): void {
    this.data.forEach(fn);
  }

  forEachFromTop(fn: (v: V) => void): void {
    [ ...this.data ].reverse().forEach(fn);
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
export const immutable = <V>(
  options: StackOpts = {},
  ...startingItems: ReadonlyArray<V>
): IStackImmutable<V> => new StackImmutable({ ...options }, [ ...startingItems ]);
