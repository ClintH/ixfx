export type Dispatch<V> = (value: V) => void;

type Wrap<V> = {
  readonly handler: Dispatch<V>
  readonly id: string
  readonly once: boolean
}

export class DispatchList<V> {
  #handlers: Array<Wrap<V>>
  #counter = 0;
  readonly #id = Math.floor(Math.random() * 100);
  constructor() {

    this.#handlers = [];
  }

  add(handler: Dispatch<V>, options: { once?: boolean } = {}): string {
    this.#counter++;
    const once = options.once ?? false;
    const wrap: Wrap<V> = {
      id: this.#id + `-` + this.#counter,
      handler,
      once
    }
    this.#handlers.push(wrap);
    return wrap.id;
  }

  remove(id: string): boolean {
    const length = this.#handlers.length;
    this.#handlers = this.#handlers.filter(handler => handler.id !== id);
    return this.#handlers.length !== length;
  }

  notify(value: V) {
    for (const handler of this.#handlers) {
      handler.handler(value);
      if (handler.once) {
        this.remove(handler.id);
      }
    }
  }

  clear() {
    this.#handlers = [];
  }
}