import { type Dispatch, DispatchList } from "../flow/DispatchList.js";
import { resolveSource } from "./ResolveSource.js";
import type { InitLazyStreamInitedOptions, InitLazyStreamOptions, InitStreamOptions, Passed, ReactiveInitialStream, ReactiveOrSource, ReactiveStream, SignalKinds, UpstreamOptions } from "./Types.js";
import { messageHasValue, messageIsSignal } from "./Util.js";
import { cache } from "./Cache.js";


/**
 * Initialise a stream based on an upstream source.
 * Calls initLazyStream under the hood.
 * 
 * Options:
 * * onValue: called when upstream emits a value (default: does nothing with upstream value)
 * * lazy: laziness of stream (default: 'initial')
 * * disposeIfSourceDone: disposes stream if upstream disposes (default: true)
 * @ignore
 * @param upstreamSource 
 * @param options 
 * @returns 
 */
export function initUpstream<In, Out>(upstreamSource: ReactiveOrSource<In>, options: Partial<UpstreamOptions<In>>): ReactiveStream<Out> {
  const lazy = options.lazy ?? `initial`;
  const disposeIfSourceDone = options.disposeIfSourceDone ?? true;
  const onValue = options.onValue ?? ((_v: In) => {/** no-op */ })
  const source = resolveSource(upstreamSource);
  let unsub: undefined | (() => void);
  const debugLabel = options.debugLabel ? `[${ options.debugLabel }]` : ``;
  //console.log(`initUpstream${ debugLabel } creating`);

  const onStop = () => {
    //console.log(`Rx.initStream${ debugLabel } stop`);
    if (unsub === undefined) return;
    unsub();
    unsub = undefined;
    if (options.onStop) options.onStop();
  }

  const onStart = () => {
    //console.log(`Rx.initStream${ debugLabel } start unsub ${ unsub !== undefined }`);
    if (unsub !== undefined) return;
    if (options.onStart) options.onStart();

    unsub = source.on(value => {
      //console.log(`Rx.initStream${ debugLabel } onValue`, value);
      if (messageIsSignal(value)) {
        if (value.signal === `done`) {
          onStop();
          events.signal(value.signal, value.context);
          if (disposeIfSourceDone) events.dispose(`Upstream source ${ debugLabel } has completed (${ value.context ?? `` })`);
        } else {
          //events.through_(value);
          events.signal(value.signal, value.context);
        }
      } else if (messageHasValue(value)) {
        //lastValue = value.value;
        onValue(value.value);
      }
    });
  }



  //const initOpts = 
  // const events:ReactiveInitialStream<Out>|ReactiveStream<Out> = ((`initialValue` in options) && options.initialValue !== undefined) ?
  //   initLazyStreamWithInitial<Out>({ ...initOpts, initialValue: options.initialValue }) :
  //   initLazyStream<Out>(initOpts);
  //console.log(`initUpstream${ debugLabel } creating initLazyStream`);

  const events = initLazyStream<Out>({
    ...options,
    lazy,
    onStart,
    onStop
  });
  return events;
}


export function initLazyStreamWithInitial<V>(options: InitLazyStreamInitedOptions<V>): ReactiveInitialStream<V> {
  const r = initLazyStream<V>(options);
  const c = cache<V, typeof r>(r, options.initialValue);
  return c;
}

export function initLazyStream<V>(options: InitLazyStreamOptions): ReactiveStream<V> {
  const lazy = options.lazy ?? `initial`;
  const onStop = options.onStop ?? (() => { /* no-op*/ })
  const onStart = options.onStart ?? (() => {/* no-op*/ })
  const debugLabel = options.debugLabel ? `[${ options.debugLabel }]` : ``;
  const events = initStream<V>({
    ...options,
    onFirstSubscribe() {
      if (lazy !== `never`) {
        //console.log(`initLazyStream${ debugLabel } onFirstSubscribe, lazy: ${ lazy }. Calling onStart`);
        onStart();
      }
    },
    onNoSubscribers() {
      if (lazy === `very`) {
        //console.log(`initLazyStream${ debugLabel } onNoSubscribers, lazy: ${ lazy }. Calling onStop`);
        onStop();
      }
    },
  });
  if (lazy === `never`) onStart();
  return events;
}

/**
 * Initialises a new stream.
 * 
 * Options:
 * * onFirstSubscribe: Called when there is a subscriber after there have been no subscribers.
 * * onNoSubscribers: Called when there are no more subscribers. 'onFirstSubscriber' will be called next time a subscriber is added.
 * @ignore
 * @param options 
 * @returns 
 */
export function initStream<V>(options: Partial<InitStreamOptions> = {}): ReactiveStream<V> {
  let dispatcher: DispatchList<Passed<V>> | undefined;
  let disposed = false;
  let firstSubscribe = false;
  let emptySubscriptions = true;
  const onFirstSubscribe = options.onFirstSubscribe ?? undefined;
  const onNoSubscribers = options.onNoSubscribers ?? undefined;
  const debugLabel = options.debugLabel ? `[${ options.debugLabel }]` : ``;

  const isEmpty = () => {
    if (dispatcher === undefined) return;
    if (!dispatcher.isEmpty) return;
    if (!emptySubscriptions) {
      emptySubscriptions = true;
      firstSubscribe = false;
      if (onNoSubscribers) onNoSubscribers();
    }
  }

  const subscribe = (handler: Dispatch<Passed<V>>) => {
    if (disposed) throw new Error(`Disposed, cannot subscribe ${ debugLabel }`);
    if (dispatcher === undefined) dispatcher = new DispatchList();
    //console.log(`initStream${ debugLabel } subscribe handler:`, handler);
    const id = dispatcher.add(handler);
    emptySubscriptions = false;
    if (!firstSubscribe) {
      firstSubscribe = true;
      //if (onFirstSubscribe) setTimeout(() => { onFirstSubscribe() }, 10);
      if (onFirstSubscribe) onFirstSubscribe();
    }
    return () => {
      dispatcher?.remove(id);
      isEmpty();
    }
  }

  return {
    dispose: (reason: string) => {
      if (disposed) return;
      dispatcher?.notify({ value: undefined, signal: `done`, context: `Disposed: ${ reason }` });
      disposed = true;
      if (options.onDispose) options.onDispose(reason);
    },
    isDisposed: () => {
      return disposed
    },
    removeAllSubscribers: () => {
      dispatcher?.clear();
      isEmpty();
    },
    set: (v: V) => {
      if (disposed) throw new Error(`${ debugLabel } Disposed, cannot set`);
      dispatcher?.notify({ value: v });
    },
    // through: (pass: Passed<V>) => {
    //   if (disposed) throw new Error(`Disposed, cannot through`);
    //   dispatcher?.notify(pass)
    // },
    signal: (signal: SignalKinds, context?: string) => {
      if (disposed) throw new Error(`${ debugLabel } Disposed, cannot signal`);
      dispatcher?.notify({ signal, value: undefined, context });
    },
    on: (handler: Dispatch<Passed<V>>) => subscribe(handler),
    onValue: (handler: (value: V) => void) => {
      const unsub = subscribe(message => {
        //console.log(`initStream${ debugLabel } onValue wrapper`, message);
        if (messageHasValue(message)) {
          handler(message.value);
        }
      });
      return unsub;
    }
  }
}
