import { isIterable } from "@ixfx/iterables";
import type { Passed, PassedSignal, PassedValue, Reactive, ReactiveDiff, ReactiveInitial, ReactiveOrSource, ReactivePingable, ReactiveWritable, Wrapped } from "./types.js";
import type { Trigger, TriggerValue, TriggerFunction, TriggerGenerator } from "./from/types.js";

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

export const isPingable = <V>(rx: Reactive<V> | ReactiveDiff<V> | object): rx is ReactivePingable<V> => {
  if (!isReactive(rx)) return false;
  if (`ping` in rx) {
    return true;
  }
  return false;
}

export const hasLast = <V>(rx: Reactive<V> | ReactiveDiff<V> | object): rx is ReactiveInitial<V> => {
  if (!isReactive(rx)) return false;
  if (`last` in rx) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const v = (rx as any).last();
    if (v !== undefined) return true;
  }
  return false;
}

/**
 * Returns _true_ if `rx` is a Reactive
 * @param rx 
 * @returns 
 */
export const isReactive = <V>(rx: object): rx is Reactive<V> => {
  if (typeof rx !== `object`) return false;
  if (rx === null) return false;
  if (!(`on` in rx) || !(`onValue` in rx)) return false;
  return (typeof (rx as any).on === 'function' && typeof (rx as any).onValue === 'function');
}

/**
 * Returns true if `rx` is a disposable reactive.
 * @param rx 
 * @returns 
 */
// export const isDisposable = <V>(rx: Reactive<V> | ReactiveWritable<V>): rx is ReactiveDisposable<V> => {
//   if (!isReactive(rx)) return false;
//   return (`isDisposed` in rx && `dispose` in rx);
// }

/**
 * Returns _true_ if `rx` is a writable Reactive
 * @param rx 
 * @returns 
 */
export const isWritable = <V>(rx: Reactive<V> | ReactiveWritable<V>): rx is ReactiveWritable<V> => {
  if (!isReactive(rx)) return false;
  if (`set` in rx) return true;
  return false;
}

export const isWrapped = <T>(v: any): v is Wrapped<T> => {
  if (typeof v !== `object`) return false;
  if (v === null) return false;
  if (!(`source` in v)) return false;
  if (!(`annotate` in v)) return false;
  return true;
}

// export const opify = <TIn, TOut = TIn,>(fn: (source: ReactiveOrSource<TIn>, ...args: Array<any>) => Reactive<TOut>, ...args: Array<any>) => {
//   return (source: ReactiveOrSource<TIn>) => {
//     return fn(source, ...args);
//   }
// }

export const opify = <TIn, TRxOut = Reactive<TIn>>(fn: (source: ReactiveOrSource<TIn>, ...args: any[]) => TRxOut, ...args: any[]): (source: ReactiveOrSource<TIn>) => TRxOut => {
  return (source: ReactiveOrSource<TIn>) => {
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

/**
 * Resolves a trigger value.
 * 
 * A trigger can be a value, a function or generator. Value triggers never complete.
 * A trigger function is considered complete if it returns undefined.
 * A trigger generator is considered complete if it returns done.
 * 
 * Returns `[value, _false_]` if we have a value and trigger is not completed.
 * Returns `[value, _true_]` trigger is completed
 * @param t 
 * @returns 
 */
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