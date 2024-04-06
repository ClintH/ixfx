import type { Passed, PassedSignal, PassedValue, Reactive, ReactiveDiff, ReactiveDisposable, ReactiveInitial, ReactiveOrSource } from "./Types.js";

export function messageIsSignal<V>(message: Passed<V> | PassedSignal): message is PassedSignal {
  if (message.value !== undefined) return false;
  if (`signal` in message && message.signal !== undefined) return true;
  return false;
}

export function messageIsDoneSignal<V>(message: Passed<V> | PassedSignal): boolean {
  if (message.value !== undefined) return false;
  if (`signal` in message && message.signal === `done`) return true;
  return false;
}

/**
 * Returns _true_ if `v` has a non-undefined value. Note that sometimes
 * _undefined_ is a legal value to pass
 * @param v 
 * @returns 
 */
export function messageHasValue<V>(v: Passed<V> | PassedSignal): v is PassedValue<V> {
  if (v.value !== undefined) return true;
  return false;
}


export const hasLast = <V>(rx: Reactive<V> | ReactiveDiff<V> | object): rx is ReactiveInitial<V> => {
  if (!isReactive(rx)) return false;
  if (`last`) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const v = (rx as any).last();
    if (v !== undefined) return true;
  }
  return false;
}

export const isReactive = <V>(rx: object): rx is Reactive<V> => {
  if (typeof rx !== `object`) return false;
  return (`on` in rx && `value` in rx)
}

export const isDisposable = (v: object): v is ReactiveDisposable => {
  return (`isDisposed` in v && `dispose` in v);
}

export const opify = <V>(fn: (source: ReactiveOrSource<V>, ...args: Array<any>) => Reactive<V>, ...args: Array<any>) => {
  return (source: ReactiveOrSource<V>) => {
    return fn(source, ...args);
  }
}
