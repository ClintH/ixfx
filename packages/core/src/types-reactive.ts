/**
 * A reactive that does not have an initial value
 */
export type ReactiveNonInitial<V> = Reactive<V> & {
  last(): V | undefined
}

/**
 * A reactive with an initial value
 */
export type ReactiveInitial<V> = Reactive<V> & {
  last(): V
}

/**
 * Unsubscribes from a reactive
 */
export type Unsubscriber = () => void;
/**
 * Signals
 */
export type SignalKinds = `done` | `warn`;
/**
 * A message
 */
export type Passed<V> = {
  value: V | undefined
  signal?: SignalKinds
  context?: string
}
/**
 * A Reactive
 */
export type Reactive<V> = {
  /**
   * Subscribes to a reactive. Receives
   * data as well as signals. Use `onValue` if you
   * just care about values.
   * 
   * Return result unsubscribes.
   * 
   * ```js
   * const unsub = someReactive.on(msg => {
   *    // Do something with msg.value
   * });
   * 
   * unsub(); // Unsubscribe
   * ```
   * @param handler 
   */
  on(handler: (value: Passed<V>) => void): Unsubscriber
  /**
   * Subscribes to a reactive's values.
   * Returns a function that unsubscribes.
   * @param handler
   */
  onValue(handler: (value: V) => void): Unsubscriber

  /**
   * Disposes the reactive, providing a reason for debug tracing
   * @param reason 
   */
  dispose(reason: string): void
  /**
   * Returns _true_ if Reactive is disposed
   */
  isDisposed(): boolean
  /**
   * Optional 'set' to write a value.
   * @param value 
   */
  set?(value: V): void
}

