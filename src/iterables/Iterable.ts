type WithEvents = {
  addEventListener(type: string, callbackfn: any): void;
  removeEventListener(type: string, callbackfn: any): void;
}

export const isAsyncIterable = (v: any): v is AsyncIterable<any> =>
  Symbol.asyncIterator in new Object(v);

export const isIterable = (v: any): v is Iterable<any> =>
  Symbol.iterator in new Object(v);



export const eventsToIterable = <V>(
  eventSource: WithEvents,
  eventType: string
): AsyncIterator<any> => {
  const pullQueue: Array<any> = [];
  const pushQueue: Array<any> = [];
  let done = false;
  const pushValue = (args: any) => {
    if (pullQueue.length > 0) {
      //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const resolver = pullQueue.shift();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      resolver(...args);
    } else {
      pushQueue.push(args);
    }
  };

  const pullValue = (): Promise<V> =>
    new Promise<V>((resolve) => {
      if (pushQueue.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const arguments_ = pushQueue.shift();
        // @ts-expect-error
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
      if (done) return { done: true, value: undefined };
      return {
        done: false,
        value: await pullValue(),
      };
    },
    //eslint-disable-next-line @typescript-eslint/require-await
    return: async (): Promise<IteratorResult<V>> => {
      done = true;
      eventSource.removeEventListener(eventType, handler);
      return { done: true, value: undefined };
    },
    //eslint-disable-next-line @typescript-eslint/require-await
    throw: async (error: any): Promise<IteratorResult<V>> => {
      done = true;
      return {
        done: true,
        value: Promise.reject(new Error(error)),
      };
    },
  };
  return r;
};