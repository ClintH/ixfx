export class QueueMutable<V> {
  #store: V[] = [];

  enqueue(data: V): void {
    this.#store.push(data);
  }

  dequeue(): V | undefined {
    return this.#store.shift();
  }

  /**
   * Removes and returns all remaining values, in queue order.
   */
  dequeueRemaining(): V[] {
    return this.#store.splice(0);
  }
}