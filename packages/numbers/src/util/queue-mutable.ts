export class BasicQueueMutable<V> {
  #store: V[] = [];

  enqueue(data: V): void {
    this.#store.push(data);
  }

  dequeue(): V | undefined {
    return this.#store.shift();
  }

  get data(): V[] {
    return this.#store;
  }
  get size(): number {
    return this.#store.length;
  }
}