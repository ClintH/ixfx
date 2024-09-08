/* eslint-disable @typescript-eslint/unbound-method */
import * as MapFns from "../../data/maps/MapFns.js"
import { initStream } from "../InitStream.js"
import { resolveSource } from "../ResolveSource.js"
import type { ReactiveOrSource, CombineLatestOptions, Reactive, RxValueTypeObject, ReactiveInitial, RxValueTypeRx, ReactiveDiff } from "../Types.js"
import { messageIsDoneSignal, messageHasValue, isWritable } from "../Util.js"
import { object } from "../sources/Object.js"

export type CombineLatestToObject<T extends Record<string, ReactiveOrSource<any>>> = {
  hasSource: (field: string) => boolean,
  replaceSource: (field: Extract<keyof T, string>, source: ReactiveOrSource<any>) => void
  /**
   * Reactive sources being combined
   */
  sources: RxValueTypeRx<T>
  /**
   * Updates writable sources with values.
   * @param data 
   * @returns Keys and values set to writable source(s)
   */
  setWith: (data: Partial<RxValueTypeObject<T>>) => Partial<RxValueTypeObject<T>>
} & ReactiveDiff<RxValueTypeObject<T>> & ReactiveInitial<RxValueTypeObject<T>>;

/**
 * Monitors input reactive values, storing values as they happen to an object.
 * Whenever a new value is emitted, the whole object is sent out, containing current
 * values from each source (or _undefined_ if not yet emitted)
 * 
 * See {@link combineLatestToArray} to combine streams by name into an array instead.
 * 
 * ```
 * const sources = {
 *  fast: Rx.fromFunction(Math.random, { loop: true, interval: 100 }),
 *  slow: Rx.fromFunction(Math.random, { loop: true, interval: 200 })
 * ];
 * const r = Rx.combineLatestToObject(sources);
 * r.onValue(value => {
 *  // 'value' will be an object containing the labelled latest
 *  // values from each source.
 *  // { fast: number, slow: number }
 * });
 * ```
 * 
 * The tempo of this stream will be set by the fastest source stream.
 * See {@link syncToObject} to have pace determined by slowest source, and only
 * send when each source has produce a new value compared to last time.
 * 
 * This source ends if all source streams end.
 * @param reactiveSources Sources to merge
 * @param options Options for merging 
 * @returns 
 */
export function combineLatestToObject<const T extends Record<string, ReactiveOrSource<any>>>(reactiveSources: T, options: Partial<CombineLatestOptions> = {}): CombineLatestToObject<T> {// { sources: RxValueTypeRx<T> } & Reactive<RxValueTypeObject<T>> & ReactiveInitial<RxValueTypeObject<T>> {
  type State<V> = {
    source: Reactive<V>
    done: boolean
    data: V | undefined
    off: () => void
  }
  const disposeSources = options.disposeSources ?? true;
  const event = object<RxValueTypeObject<T>>(undefined);
  const onSourceDone = options.onSourceDone ?? `break`;
  const emitInitial = options.emitInitial ?? true;
  let emitInitialDone = false;

  const states = new Map<string, State<any>>();
  for (const [ key, source ] of Object.entries(reactiveSources)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const initialData = (`last` in source) ? (source as any).last() : undefined;
    //console.log(`initialData: ${ initialData } src: ${ (source as any).last() }`);
    const s: State<any> = {
      source: resolveSource(source),
      done: false,
      data: initialData,
      off: () => { /** no-op */ }
    }
    states.set(key, s);
  }
  const sources = Object.fromEntries(Object.entries(states).map(entry => [ entry[ 0 ], entry[ 1 ].source ])) as RxValueTypeRx<T>;
  // eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
  const someUnfinished = () => MapFns.some(states, v => !v.done);

  const unsub = () => {
    //console.log(`Rx.MergeToObject.unsub states: ${ [ ...states.keys() ].join(`,`) }`);
    for (const state of states.values()) state.off();
  }

  const getData = () => {
    const r = {};
    for (const [ key, state ] of states) {
      const d = state.data;
      if (d !== undefined) {
        (r as any)[ key ] = state.data;
      }
    }
    //console.log(`Rx.Ops.CombineLatestToObject getData`, r);

    return r as RxValueTypeObject<T>;
  }

  const trigger = () => {
    emitInitialDone = true;
    const d = getData();
    //console.log(`Rx.Ops.combineLatestToObject trigger`, d);
    event.set(d);
  }

  const wireUpState = (state: State<any>) => {
    state.off = state.source.on(message => {
      if (messageIsDoneSignal(message)) {
        state.done = true;
        state.off();
        state.off = () => {/**no-op */ }
        if (onSourceDone === `break`) {
          unsub();
          event.dispose(`Source has completed and 'break' is behaviour`);
          return;
        }
        if (!someUnfinished()) {
          // All sources are done
          unsub();
          event.dispose(`All sources completed`);
        }
      } else if (messageHasValue(message)) {
        state.data = message.value;
        trigger();
      }
    });
  }

  for (const state of states.values()) {
    wireUpState(state);
  }

  if (!emitInitialDone && emitInitial) {
    //console.log(`Rx.Ops.CombineLatestToObject emitting initial`);
    trigger();
  }
  return {
    ...event,
    hasSource(field: string) {
      return states.has(field)
    },
    replaceSource(field, source) {
      const state = states.get(field);
      if (state === undefined) throw new Error(`Field does not exist: '${ field }'`);
      state.off();
      const s = resolveSource(source);
      state.source = s;
      wireUpState(state);
    },
    setWith(data) {
      let written = {};
      for (const [ key, value ] of Object.entries(data)) {
        const state = states.get(key);
        if (state !== undefined) {
          if (isWritable(state.source)) {
            state.source.set(value);
            (written as any)[ key ] = value;
          }
          state.data = value;
        }
      }
      return written;
    },
    sources,
    last() {
      return getData()
    },
    dispose(reason: string) {
      unsub();
      event.dispose(reason);
      if (disposeSources) {
        for (const v of states.values()) {
          v.source.dispose(`Part of disposed mergeToObject`)
        }
      }
    }
  }
}