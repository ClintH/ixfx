import type { IStack } from './IStack.js';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface IStackImmutable<V> extends IStack<V> {
  push(...toAdd: readonly V[]): IStackImmutable<V>;
  pop(): IStackImmutable<V>;
}
