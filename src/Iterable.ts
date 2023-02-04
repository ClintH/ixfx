/* eslint-disable */
type WithEvents = {
  addEventListener(type: string, callbackfn: any): void;
  removeEventListener(type: string, callbackfn: any): void;
}

export { eachInterval } from './flow/Interval.js';

export const isAsyncIterable = (v: any): v is AsyncIterable<any> => Symbol.asyncIterator in Object(v);

export const isIterable = (v: any): v is Iterable<any> => Symbol.iterator in Object(v);

export const eventsToIterable = <V>(eventSource: WithEvents, eventType: string): AsyncIterator<any, any, undefined> => {
  const pullQueue: any[] = [];
  const pushQueue: any[] = [];
  //eslint-disable-next-line functional/no-let
  let done = false;
  const pushValue = async (args: any) => {
    if (pullQueue.length !== 0) {
      const resolver = pullQueue.shift();
      resolver(...args);
    } else {
      pushQueue.push(args);
    }
  };

  const pullValue = (): Promise<V> => new Promise<V>((resolve) => {
    if (pushQueue.length !== 0) {
      const args = pushQueue.shift();
      // @ts-ignore
      resolve(...args);
    } else {
      pullQueue.push(resolve);
    }
  });

  const handler = (...args: any) => {
    pushValue(args);
  };

  eventSource.addEventListener(eventType, handler);
  const r = {
    next: async (): Promise<IteratorResult<V>> => {
      if (done) return {done: true, value: undefined};
      return {
        done: false,
        value: await pullValue()
      };
    },
    return: async (): Promise<IteratorResult<V>> => {
      done = true;
      eventSource.removeEventListener(eventType, handler);
      return {done: true, value: undefined};
    },
    throw: async (error: any): Promise<IteratorResult<V>> => {
      done = true;
      return {
        done: true,
        value: Promise.reject(error)
      };
    }
  };
  return r;
};