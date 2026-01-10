import { promiseWithResolvers } from "./promise-with-resolvers.js";

/**
 * Queue of a single item, only once, allows for simple synchronisation.
 * 
 * It has a 'first write wins' behaviour
 * 
 * ```js
 * const q = new WaitForValue(); // or singleItem();
 * 
 * // In some part of the code add a value
 * const value = q.add(`some-val`);
 * 
 * // Somewhere else, wait for value
 * await q.get(value);
 * ```
 * 
 * It is not possible to `add` a second item (an exception will throw), however
 * it is possible to call `get` as many times as you need.
 * 
 * The `.isUsed` property allows you to to check if a value
 * has been already added to the queue.
 * 
 * Based on: https://2ality.com/2024/05/proposal-promise-with-resolvers.html
 */
export class WaitForValue<T> {
  #promise
  #resolve
  #written = false;
  constructor() {
    const { promise, resolve } = promiseWithResolvers<T>();
    this.#promise = promise;
    this.#resolve = resolve;
  }

  /**
   * Gets the promise
   * ```js
   * const wv = new WaitForValue();
   * 
   * await wv.get();
   * ```
   * @returns
   */
  get(): Promise<T> {
    return this.#promise;
  }

  /**
   * Adds a value, triggering promise resolution.
   * 
   * Throws an exception if queue has already been used. Use {@link isUsed} to check.
   * @param value 
   */
  add(value: T): void {
    if (this.#written) throw new Error(`QueueSingleUse has already been used`);
    this.#written = true;
    this.#resolve(value);
  }

  /**
   * Returns _true_ if a value has been added
   * and therefore no more values can be written
   */
  get isUsed(): boolean {
    return this.#written;
  }
}

/**
 * {@inheritDoc WaitForValue}
 */
export const singleItem = <T>(): WaitForValue<T> => new WaitForValue<T>();