export type ReactiveNonInitial<V> = Reactive<V> & {
  last(): V | undefined
}

export type ReactiveInitial<V> = Reactive<V> & {
  last(): V
}

export type Unsubscriber = () => void;
export type SignalKinds = `done` | `warn`;
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

