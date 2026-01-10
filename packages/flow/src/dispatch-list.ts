export type Dispatch<V> = ((value: V) => void) | ((value: V) => boolean);

/**
 * Dispatcher
 */
type DispatchEntry<V> = {
  /**
   * Handler function
   */
  readonly handler: Dispatch<V>
  /**
   * Generated id of entry
   */
  readonly id: string
  /**
   * If true, dispatcher is removed after first firing
   * If the handler returns a boolean value, it will only be removed if that value is true.
   */
  readonly once: boolean
}

/**
 * Maintains a list of listeners to receive data.
 * 
 * Type parameter is the type of events sent.
 * 
 * ```js
 * const d = new DispatchList();
 * 
 * // Eg: add a listener
 * d.add(v => {
 *  // Handle a value
 * });
 * 
 * // Eg. send a value to all listeners
 * d.notify(`some value`);
 * ```
 * 
 * If event handler returns true, additional handlers are not called.
 */
export class DispatchList<V> {
  #handlers: DispatchEntry<V>[]
  #counter = 0;
  readonly #id = Math.floor(Math.random() * 100);

  constructor() {
    this.#handlers = [];
  }

  /**
   * Returns _true_ if list is empty
   * @returns 
   */
  isEmpty(): boolean {
    return this.#handlers.length === 0;
  }

  /**
   * Adds a handler. You get back an id which can be used
   * to remove the handler later.
   * 
   * Handlers can be added with 'once' flag set to _true_. This will
   * automatically remove them after the first value is sent to them.
   * 
   * If handler returns _true_, subsequent handlers are not invoked.
   * @param handler 
   * @param options 
   * @returns 
   */
  add(handler: Dispatch<V>, options: { once?: boolean } = {}): string {
    this.#counter++;
    const once = options.once ?? false;
    const wrap: DispatchEntry<V> = {
      id: `${ this.#id } - ${ this.#counter }`,
      handler,
      once
    }
    this.#handlers.push(wrap);
    return wrap.id;
  }

  /**
   * Remove a handler by its id.
   * @param id 
   * @returns _True_ if handler was removed, _false_ if not found.
   */
  remove(id: string): boolean {
    const length = this.#handlers.length;
    this.#handlers = this.#handlers.filter(handler => handler.id !== id);
    return this.#handlers.length !== length;
  }

  /**
   * Emit a value to all handlers
   * Returns _true_ if at least one handler reported 'true' as a response.
   * Also returns true
   * @param value 
   */
  notify(value: V): boolean {
    for (const handler of this.#handlers) {
      const r = handler.handler(value);

      // Handler returned a boolean
      if (typeof r === `boolean`) {
        // True was returned
        if (r) {
          // If handler was one-time, remove it
          if (handler.once) {
            this.remove(handler.id);
          }
          return true;
        }
      } else if (handler.once) {
        // Remove handler
        this.remove(handler.id);
      }
    }
    return false;
  }

  /**
   * Remove all handlers
   */
  clear(): void {
    this.#handlers = [];
  }
}