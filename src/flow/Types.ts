export type HasCompletionRunStates = `idle` | `scheduled` | `running`;
export type HasCompletion = {
  /**
   * Gets the current run state
   * idle: not yet started or completed with no future run scheduled
   * scheduled: waiting to run
   * running: currently executing its callback
   */
  get runState(): HasCompletionRunStates
  /**
   * Returns the number of times the scheduled function
   * has been executed.
   * 
   * This number will be reset in some conditions.
   * For example `continuously` resets it when the loop stops.
   * 
   * Use {@link startCountTotal} to track total number.
   */
  get startCount(): number

  /**
   * Total number of times scheduled function has been
   * executed.
   */
  get startCountTotal(): number
};

export type AsyncPromiseOrGenerator<V> =
  | (() => Promise<V> | Promise<undefined>)
  | (() => V | undefined)
  | Generator<V>
  | IterableIterator<V>
  | AsyncIterableIterator<V>
  | AsyncGenerator<V>
  | AsyncIterable<V>
  | Iterable<V>;
