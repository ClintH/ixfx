/* eslint-disable */

export type Timer = {
  reset(): void
  get elapsed(): number
}

export type HasCompletion = {
  get isDone(): boolean;
}

/**
 * A resettable timeout, returned by {@link resettableTimeout}
 */
export type  ResettableTimeout = HasCompletion & {
  start(altTimeoutMs?: number): void;
  cancel(): void;
  get isDone(): boolean;
}

/**
 * Runs a function continuously, returned by {@link Continuously}
 */
export type Continuously = HasCompletion & {
  start(): void
  get ticks(): number
  get isDone(): boolean
  cancel(): void
}