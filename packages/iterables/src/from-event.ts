import type { WithEvents } from "./types.js";

export function fromEvent<V>(eventSource: WithEvents, eventType: string): AsyncIterator<any> {
  const pullQueue: any[] = [];
  const pushQueue: any[] = [];
  let done = false;
  const pushValue = (args: any) => {
    if (pullQueue.length > 0) {
      const resolver = pullQueue.shift();
      resolver(...args);
    } else {
      pushQueue.push(args);
    }
  };

  const pullValue = (): Promise<V> =>
    new Promise<V>((resolve) => {
      if (pushQueue.length > 0) {
        const arguments_ = pushQueue.shift();
        // @ts-expect-error arguments_ is variadic args saved from push()
        resolve(...arguments_);
      } else {
        pullQueue.push(resolve);
      }
    });

  const handler = (...arguments_: any) => {
    pushValue(arguments_);
  };

  eventSource.addEventListener(eventType, handler);

  const r: AsyncIterator<V> = {
    next: async (): Promise<IteratorResult<V>> => {
      if (done)
        return { done: true, value: undefined };
      return {
        done: false,
        value: await pullValue(),
      };
    },
    // eslint-disable-next-line ts/require-await
    return: async (): Promise<IteratorResult<V>> => {
      done = true;
      eventSource.removeEventListener(eventType, handler);
      return { done: true, value: undefined };
    },
    // eslint-disable-next-line ts/require-await
    throw: async (error: any): Promise<IteratorResult<V>> => {
      done = true;
      eventSource.removeEventListener(eventType, handler);
      // Returning a rejected promise here (as this used to) would create an
      // unhandled rejection, since nothing awaits `value` on a done result.
      // The caller already holds the error they passed in.
      return { done: true, value: error };
    },
  };
  return r;
}