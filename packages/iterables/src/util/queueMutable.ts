export class QueueMutable<V> {
  #store: V[] = [];

  enqueue(data: V) {
    this.#store.push(data);
  }

  dequeue(): V | undefined {
    return this.#store.shift();
  }
}