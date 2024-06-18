/* eslint-disable @typescript-eslint/unbound-method */
import { intervalToMs } from "../../flow/IntervalType.js";
import { initStream } from "../InitStream.js";
import { resolveSource } from "../ResolveSource.js";
import type { ReactiveOrSource, Reactive, RxValueTypes } from "../Types.js";
import { messageIsSignal } from "../Util.js";
import type { SyncOptions } from "./Types.js";

/**
 * Waits for all sources to produce a value, sending the combined results as an array.
 * After sending, it waits again for each source to send at least one value.
 * 
 * Use {@link syncToObject} to output objects based on labelled sources rather than an array of values.
 * 
 * Pace will be set by the slowest source. Alternatively, use {@link combineLatestToArray} where the rate is determined by fastest source.
 * 
 * Only complete results are sent. For example if source A & B finish and source C is still producing values,
 * synchronisation is not possible because A & B stopped producing values. Thus the stream will self-terminate
 * after `maximumWait` (2 seconds). The newer values from C are lost.
 */
export function syncToArray<const T extends ReadonlyArray<ReactiveOrSource<any>>>(reactiveSources: T, options: Partial<SyncOptions> = {}): Reactive<RxValueTypes<T>> {
  const onSourceDone = options.onSourceDone ?? `break`;
  const finalValue = options.finalValue ?? `undefined`;
  const maximumWait = intervalToMs(options.maximumWait, 2000);

  let watchdog: ReturnType<typeof globalThis.setTimeout> | undefined;

  type State<V> = {
    done: boolean,
    finalData: V | undefined,
    source: Reactive<V>
    unsub: () => void
  }

  const data: Array<RxValueTypes<T> | undefined> = [];
  //const finalData: Array<RxValueTypes<T> | undefined> = [];

  // Resolve sources
  //const sources = reactiveSources.map(source => resolveSource(source));
  //const noop = () => {/*no-op*/ }
  //const sourcesUnsub: Array<Unsubscriber> = sources.map(_ => noop);

  const states: Array<State<any>> = reactiveSources.map(source => ({
    finalData: undefined,
    done: false,
    source: resolveSource(source),
    unsub: () => {/**no-op */ }
  }));


  const unsubscribe = () => {
    for (const s of states) {
      s.unsub();
      s.unsub = () => {/**no-op */ }
    }
  }

  const isDataSetComplete = () => {
    // eslint-disable-next-line unicorn/no-for-loop
    for (let index = 0; index < data.length; index++) {
      if (onSourceDone === `allow` && states[ index ].done) continue;
      if (data[ index ] === undefined) return false;
    }
    return true;
  }

  const hasIncompleteSource = () => states.some(s => !s.done);
  const resetDataSet = () => {
    for (let index = 0; index < data.length; index++) {
      if (finalValue === `last` && states[ index ].done) continue; // Don't overwrite
      data[ index ] = undefined;
    }
  }

  const onWatchdog = () => {
    done(`Sync timeout exceeded (${ maximumWait.toString() })`);
  }

  const done = (reason: string) => {
    if (watchdog) clearTimeout(watchdog);
    unsubscribe();
    event.dispose(reason);
  }

  const init = () => {
    watchdog = setTimeout(onWatchdog, maximumWait);

    for (const [ index, state ] of states.entries()) {
      data[ index ] = undefined; // init array positions to be undefined

      state.unsub = state.source.on(valueChanged => {
        if (messageIsSignal(valueChanged)) {
          if (valueChanged.signal === `done`) {
            state.finalData = data[ index ];
            state.unsub();
            state.done = true;
            state.unsub = () => { /** no-op */ }
            if (finalValue === `undefined`) data[ index ] = undefined;
            if (onSourceDone === `break`) {
              done(`Source '${ index.toString() }' done, and onSourceDone:'break' is set`);
              return;
            }
            if (!hasIncompleteSource()) {
              done(`All sources done`);
              return;
            }
          }
          return;
        }
        data[ index ] = valueChanged.value;

        if (isDataSetComplete()) {
          // All array elements contain values
          // Emit data and reset
          event.set([ ...data ] as RxValueTypes<T>);
          resetDataSet();
          if (watchdog) clearTimeout(watchdog);
          watchdog = setTimeout(onWatchdog, maximumWait);
        }
      });
    }
  }

  const event = initStream<RxValueTypes<T>>({
    onFirstSubscribe() {
      unsubscribe();
      init();
    },
    onNoSubscribers() {
      if (watchdog) clearTimeout(watchdog);
      unsubscribe();

    },
  });

  return {
    dispose: event.dispose,
    isDisposed: event.isDisposed,
    on: event.on,
    onValue: event.onValue
  }

}
