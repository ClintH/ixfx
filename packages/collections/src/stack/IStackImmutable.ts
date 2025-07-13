import type { IStack } from './IStack.js';

export interface IStackImmutable<V> extends IStack<V> {
  push(...toAdd: ReadonlyArray<V>): IStackImmutable<V>;
  pop(): IStackImmutable<V>;
}
