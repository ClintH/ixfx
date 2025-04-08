export type StackDiscardPolicy = `older` | `newer` | `additions`;

export type StackOpts = {
  readonly debug?: boolean;
  readonly capacity?: number;
  readonly discardPolicy?: StackDiscardPolicy;
};