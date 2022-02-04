/* eslint-disable */

export type Timer = {
  reset(): void
  elapsed(): number
}

/**
 * A resettable timeout, returned by {@link resettableTimeout}
 */
export interface ResettableTimeout {
  start(altTimeoutMs?: number): void;
  cancel(): void;
  get isDone(): boolean;
}

/**
 * Runs a function continuously, returned by {@link Continuously}
 */
export interface Continuously {
  start(): void
  get ticks(): number
  get isDone(): boolean
  cancel(): void
}