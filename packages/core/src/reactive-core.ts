import type { Reactive, ReactiveInitial } from "./types-reactive.js";

/**
 * Returns _true_ if `rx` is a Reactive
 * @param rx 
 * @returns 
 */
export const isReactive = <V>(rx: object): rx is Reactive<V> => {
  if (typeof rx !== `object`) return false;
  if (rx === null) return false;
  return (`on` in rx && `onValue` in rx)
}

export const hasLast = <V>(rx:  object): rx is ReactiveInitial<V> => {
  if (!isReactive(rx)) return false;
  if (`last` in rx) {
    const v = (rx as any).last();
    if (v !== undefined) return true;
  }
  return false;
}