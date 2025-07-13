/**
 * Simple synchronisation. Supports only a single signal/waiter.
 * Expects one or more calls to .signal() for .forSignal() to resolve
 * 
 * ```js
 * const sw = new SyncWait();
 * obj.addEventListener(`click`, () => {
 *  sw.signal();
 * });
 * 
 * // Wait until click event
 * await sw.forSignal();
 * ```
 * 
 * `forSignal` can also take a maximum time to wait. If the
 * time elapses, an exception is thrown.
 * 
 * {@link didSignal} returns _true_/_false_ if signal happened rather
 * than throwing an exception.
 * 
 */
export class SyncWait {
  #resolve?: (value?: any) => void;
  #reject?: (reason?: string) => void;
  #promise?: Promise<any>;

  signal() {
    if (this.#resolve) {
      this.#resolve();
      this.#resolve = undefined;
    }
    this.#promise = Promise.resolve();
  }

  /**
   * Throw away any previous signalled state.
   * This will cause any currently waiters to throw
   */
  flush() {
    if (this.#reject) {
      this.#reject(`Flushed`);
      this.#reject = undefined;
    }
    this.#resolve = undefined;
    this.#promise = undefined;
  }

  #initPromise() {
    const p = new Promise((resolve, reject) => {
      this.#resolve = resolve;
      this.#reject = reject;
    });
    this.#promise = p;
    return p;
  }

  /**
   * Call with `await` to wait until .signal() happens.
   * If a wait period is specified, an exception is thrown if signal does not happen within this time.
   * @param maximumWaitMs 
   */
  async forSignal(maximumWaitMs?: number) {
    let p = this.#promise;
    p ??= this.#initPromise();
    if (maximumWaitMs) {
      const reject = this.#reject;
      setTimeout(() => {
        if (reject) {
          reject(`Timeout elapsed ${ maximumWaitMs.toString() }`);
        }
      }, maximumWaitMs);
    }
    await p;
    this.#promise = undefined;
    this.#resolve = undefined;
    this.#reject = undefined;
  }

  /**
   * An alternative to {@link forSignal}, returning _true_
   * if signalled, or _false_ if wait period was exceeded 
   * 
   * ```js
   * const s = await sw.didSignal(5000);
   * ```
   * @param maximumWaitMs 
   * @returns 
   */
  async didSignal(maximumWaitMs: number): Promise<boolean> {
    try {
      await this.forSignal(maximumWaitMs);
      return true;
    } catch {
      return false;
    }
  }
}