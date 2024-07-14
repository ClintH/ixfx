import type { Reactive, ReactiveInitial, ReactiveNonInitial, ReactiveWritable } from "./Types.js";

export type CacheStream<T> = {
  resetCachedValue: () => void
  last: () => T | undefined
}

export type CacheStreamInitial<T> = CacheStream<T> & {
  last: () => T
}

// export function cache<T>(r: ReactiveWritable<T>, initialValue: T): CacheStream & ReactiveWritable<T> & ReactiveInitial<T>;
// export function cache<T>(r: ReactiveWritable<T>, initialValue?: T | undefined): CacheStream & ReactiveWritable<T> & ReactiveNonInitial<T>;

// export function cache<T>(r: ReactiveWritable<T>, initialValue: T | undefined): CacheStream & ReactiveWritable<T> & ReactiveInitial<T>;
// export function cache<T>(r: Reactive<T>, initialValue: T | undefined): CacheStream & Reactive<T> & ReactiveInitial<T>;
export function cache<TValue, RT extends Reactive<TValue>>(r: RT, initialValue: TValue): CacheStreamInitial<TValue> & RT;

export function cache<TValue, RT extends Reactive<TValue>>(r: RT, initialValue: TValue | undefined): CacheStream<TValue> & RT {
  let lastValue: TValue | undefined = initialValue;
  r.onValue(value => {
    lastValue = value;
  });
  return {
    ...r,
    last() {
      return lastValue
    },
    resetCachedValue() {
      lastValue = undefined;
    }
  }
}