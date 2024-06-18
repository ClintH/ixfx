/* eslint-disable @typescript-eslint/unbound-method */
import { Maps } from "../../collections/index.js"
import { initStream } from "../InitStream.js"
import { resolveSource } from "../ResolveSource.js"
import type { ReactiveOrSource, CombineLatestOptions, Reactive, RxValueTypeObject, ReactiveInitial } from "../Types.js"
import { messageIsDoneSignal, messageHasValue } from "../Util.js"

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
export function combineLatestToObject<const T extends Record<string, ReactiveOrSource<any>>>(reactiveSources: T, options: Partial<CombineLatestOptions> = {}): Reactive<RxValueTypeObject<T>> & ReactiveInitial<RxValueTypeObject<T>> {
  type State<V> = {
    source: Reactive<V>
    done: boolean
    data: V | undefined
    off: () => void
  }
  const disposeSources = options.disposeSources ?? true;
  const event = initStream<RxValueTypeObject<T>>();
  const onSourceDone = options.onSourceDone ?? `break`;

  const states = new Map<string, State<any>>();
  for (const [ key, source ] of Object.entries(reactiveSources)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const initialData = (`last` in source) ? (source as any).last() : undefined;
    const s: State<any> = {
      source: resolveSource(source),
      done: false,
      data: initialData,
      off: () => { /** no-op */ }
    }
    states.set(key, s);
  }
  // eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
  const someUnfinished = () => Maps.some(states, v => !v.done);

  const unsub = () => {
    //console.log(`Rx.MergeToObject.unsub states: ${ [ ...states.keys() ].join(`,`) }`);
    for (const state of states.values()) state.off();
  }

  const getData = (): RxValueTypeObject<T> => {
    const r = {};
    for (const [ key, state ] of states) {
      (r as any)[ key ] = state.data;
    }
    return r as RxValueTypeObject<T>;
  }

  for (const state of states.values()) {
    //console.log(`Rx.MergeToObject loop`);
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
        event.set(getData());
      }
    });
  }

  return {
    on: event.on,
    onValue: event.onValue,
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
    },
    isDisposed() {
      return event.isDisposed()
    },
  }
}