import type { ReactiveOrSource } from "./types.js";
import { resolveSource } from "./resolve-source.js";
import { messageHasValue, messageIsDoneSignal } from "./util.js";

/**
 * Turns a reactive source into an async generator.
 *
 * Values emitted while the consumer is busy are queued, so nothing is lost
 * if several values arrive between pulls.
 */
export async function* toGenerator<V>(source: ReactiveOrSource<V>): AsyncGenerator<V> {
  const s = resolveSource(source);

  const queue: V[] = [];
  let failure: string | undefined;
  let notify: (() => void) | undefined;

  const wake = () => {
    const n = notify;
    notify = undefined;
    n?.();
  };

  const unsub = s.on((message) => {
    if (messageHasValue(message)) {
      queue.push(message.value);
      wake();
    } else if (messageIsDoneSignal(message)) {
      failure = `Source has completed`;
      wake();
    }
  });

  try {
    while (true) {
      if (queue.length > 0) {
        yield queue.shift() as V;
        continue;
      }
      if (failure !== undefined)
        throw new Error(failure);
      await new Promise<void>((resolve) => {
        notify = resolve;
      });
    }
  } finally {
    unsub();
  }
}
