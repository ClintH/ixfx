export type ValueSetEventMap<V> = {
  readonly add: { readonly value: V; readonly updated: boolean };
  readonly clear: boolean;
  readonly delete: V;
};

export { mutable } from './SetMutable.js';
export { immutable } from './SetImmutable.js';
export { type ISetMutable } from './ISetMutable.js';
export { type ISetImmutable } from './ISetImmutable.js';
