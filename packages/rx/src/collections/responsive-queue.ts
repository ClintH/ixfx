import type { IQueueMutableWithEvents, QueueMutableEvents } from "@ixfx/collections/queue";
import { manual } from "../index.js";


/**
 * Changes to `queue` are output as a responsive stream.
 * The stream emits the full data of the queue (first item being the head of the queue)
 * whenever there is an enqueue, remove or clear operation.
 * 
 * ```js
 * const queue = new QueueMutable();
 * const r = asResponsive(queue);
 * r.onValue(v => {
 *  // v is an array of values
 * });
 * 
 * 
 * Calling `set()` on the stream enqueues data to the wrapped queue.
 * ```js
 * r.set([ `1, `2` ]); // Enqueues 1, 2
 * ```
 * @param queue 
 * @returns 
 */
export function asResponsive<T>(queue: IQueueMutableWithEvents<T>): { set: (data: T[]) => void; on(handler: (value: import("/Users/af4766/repos/ixfxfun/ixfx-alt/packages/rx/src/types").Passed<readonly T[]>) => void): import("/Users/af4766/repos/ixfxfun/ixfx-alt/packages/rx/src/types").Unsubscriber; onValue(handler: (value: readonly T[]) => void): import("/Users/af4766/repos/ixfxfun/ixfx-alt/packages/rx/src/types").Unsubscriber; dispose(reason: string): void; isDisposed(): boolean; } {
  const events = manual<readonly T[]>({
    onNoSubscribers() {
      queue.removeEventListener(`removed`, onRemoved);
      queue.removeEventListener(`enqueue`, onEnqueue);
    },
    onFirstSubscribe() {
      queue.addEventListener(`removed`, onRemoved);
      queue.addEventListener(`enqueue`, onEnqueue);
      events.set(queue.toArray());
    },
  });

  const onRemoved = (event: QueueMutableEvents<T>[ `removed` ]) => {
    events.set(event.finalData);
  }
  const onEnqueue = (event: QueueMutableEvents<T>[ `enqueue` ]) => {
    events.set(event.finalData);
  }

  const set = (data: T[]): void => {
    queue.enqueue(...data);
  }

  return {
    ...events,
    set
  }
}