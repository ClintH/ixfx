import { isIterable } from "../iterables/Iterable.js";
import type { Passed, PassedSignal, PassedValue, Reactive, ReactiveDiff, ReactiveDisposable, ReactiveInitial, ReactiveOrSource, ReactiveWritable, Wrapped } from "./Types.js";
import type { Trigger, TriggerValue, TriggerFunction, TriggerGenerator } from "./sources/Types.js";

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

export const isDisposable = <V>(v: Reactive<V> | ReactiveWritable<V>): v is ReactiveDisposable<V> => {
  return (`isDisposed` in v && `dispose` in v);
}

export const isWrapped = <T>(v: any): v is Wrapped<T> => {
  if (typeof v !== `object`) return false;
  if (!(`source` in v)) return false;
  if (!(`annotateElapsed` in v)) return false;
  return true;
}

export const opify = <V>(fn: (source: ReactiveOrSource<V>, ...args: Array<any>) => Reactive<V>, ...args: Array<any>) => {
  return (source: ReactiveOrSource<V>) => {
    return fn(source, ...args);
  }
}
export const isTriggerValue = <V>(t: Trigger<V>): t is TriggerValue<V> => (`value` in t);
export const isTriggerFunction = <V>(t: Trigger<V>): t is TriggerFunction<V> => (`fn` in t);
export const isTriggerGenerator = <V>(t: Trigger<V>): t is TriggerGenerator<V> => isIterable(t);
export const isTrigger = <V>(t: any): t is Trigger<V> => {
  if (typeof t !== `object`) return false;
  if (isTriggerValue(t)) return true;
  if (isTriggerFunction(t)) return true;
  if (isTriggerGenerator(t)) return true;
  return false;
}

export type ResolveTriggerValue<V> = [ value: V, false ];
export type ResolveTriggerDone = [ undefined, true ];

export function resolveTriggerValue<V>(t: Trigger<V>): ResolveTriggerDone | ResolveTriggerValue<V> {
  if (isTriggerValue(t)) return [ t.value, false ];
  if (isTriggerFunction(t)) {
    const v = t.fn();
    if (v === undefined) return [ undefined, true ];
    return [ v, false ];
  }
  if (isTriggerGenerator(t)) {
    const v = t.gen.next();
    if (v.done) return [ undefined, true ];
    return [ v.value, false ];
  }
  throw new Error(`Invalid trigger. Missing 'value' or 'fn' fields`);
}