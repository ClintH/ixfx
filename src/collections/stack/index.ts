export type { IStack } from './IStack.js';
export type { IStackMutable } from './IStackMutable.js';
export type { IStackImmutable } from './IStackImmutable.js';

export { StackImmutable } from './StackImmutable.js';
export { StackMutable } from './StackMutable.js';

// ✔ Unit tested!
export type StackDiscardPolicy = `older` | `newer` | `additions`;

export type StackOpts = {
  readonly debug?: boolean;
  readonly capacity?: number;
  readonly discardPolicy?: StackDiscardPolicy;
};

export { immutable } from './StackImmutable.js';
export { mutable } from './StackMutable.js';
