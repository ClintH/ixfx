/**
 * Policies for discarding items when the stack is full and new items are added.
 * 
 * * 'older': Older items are discarded first, and then pushed items added
 * * 'newer': Newer items are discarded first, and then pushed items added
 * * 'additions': Rather than remove from the stack, we remove from the set of items being pushed. This acts as an 'overflow' kind of logic.
 */
export type StackDiscardPolicy = `older` | `newer` | `additions`;

/**
 * Options when creating a stack
 */
export type StackOpts = {
  /**
   * If true, the stack will log debug information to the console. Default is _false_.
   */
  readonly debug?: boolean;
  /**
   * Capacity of the stack. If provided, the stack will be bounded to this capacity. Default is _undefined_, which means the stack is unbounded.
   */
  readonly capacity?: number;
  /**
   * Policy to use when the stack is full and new items are added. Default is `additions`. See documentation for details.
   */
  readonly discardPolicy?: StackDiscardPolicy;
};