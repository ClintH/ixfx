import { promiseWithResolvers } from "./promise-with-resolvers.js";

/**
 * Queue of a single item, only once.
 * 
 * Allows for simple synchronisation.
 * ```js
 * const q = Flow.waitForValue();
 * 
 * // In some part of the code add a value
 * const value = q.add();
 * 
 * // Somewhere else, wait for value
 * await q.get(value);
 * ```
 * 
 * It is not possible to `add` a second item, however
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


  get(): Promise<T> {
    return this.#promise;
  }

  add(value: T) {
    if (this.#written) throw new Error(`QueueSingleUse has already been used`);
    this.#written = true;
    this.#resolve(value);
  }

  /**
   * Returns _true_ if a value has been added
   * and therefore no more values can be written
   */
  get isUsed() {
    return this.#written;
  }
}

export const singleItem = <T>() => new WaitForValue<T>();