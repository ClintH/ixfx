export class BasicQueueMutable<V> {
  #store: V[] = [];

  enqueue(data: V) {
    this.#store.push(data);
  }

  dequeue(): V | undefined {
    return this.#store.shift();
  }

  get data() {
    return this.#store;
  }
  get size() {
    return this.#store.length;
  }
}