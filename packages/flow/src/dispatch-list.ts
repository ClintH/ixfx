export type Dispatch<V> = (value: V) => void;

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
   */
  readonly once: boolean
}

/**
 * Maintains a list of listeners to receive data
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
  isEmpty() {
    return this.#handlers.length === 0;
  }

  /**
   * Adds a handler. You get back an id which can be used
   * to remove the handler later.
   * 
   * Handlers can be added with 'once' flag set to _true_. This will
   * automatically remove them after the first value is sent to them.
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
   * @param value 
   */
  notify(value: V) {
    for (const handler of this.#handlers) {
      handler.handler(value);
      if (handler.once) {
        this.remove(handler.id);
      }
    }
  }

  /**
   * Remove all handlers
   */
  clear() {
    this.#handlers = [];
  }
}