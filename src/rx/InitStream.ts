import { type Dispatch, DispatchList } from "../flow/DispatchList.js";
import { resolveSource } from "./ResolveSource.js";
import type { InitLazyStreamOptions, InitStreamOptions, Passed, ReactiveOrSource, ReactiveStream, SignalKinds, UpstreamOptions } from "./Types.js";
import { messageHasValue, messageIsSignal } from "./Util.js";

/**
 * @ignore
 * @param upstreamSource 
 * @param options 
 * @returns 
 */
export const initUpstream = <In, Out>(upstreamSource: ReactiveOrSource<In>, options: Partial<UpstreamOptions<In>>) => {
  const lazy = options.lazy ?? `initial`;
  const disposeIfSourceDone = options.disposeIfSourceDone ?? true;
  const onValue = options.onValue ?? ((_v: In) => {/** no-op */ })
  const source = resolveSource(upstreamSource);
  let unsub: undefined | (() => void);

  const start = () => {
    if (unsub !== undefined) return;

    if (options.onStart) options.onStart();
    unsub = source.on(value => {
      if (messageIsSignal(value)) {
        if (value.signal === `done`) {
          stop();
          if (disposeIfSourceDone) events.dispose(`Upstream source has completed (${ value.context ?? `` })`);
        } else {
          events.through(value);
        }
      } else if (messageHasValue(value)) {
        onValue(value.value);
      }
    });
  }

  const stop = () => {
    if (unsub === undefined) return;
    unsub();
    unsub = undefined;
    if (options.onStop) options.onStop();
  }

  const events = initLazyStream<Out>({
    ...options,
    lazy,
    onStart() {
      start();
    },
    onStop() {
      stop();
    }
  });
  return events;
}


export function initLazyStream<V>(options: InitLazyStreamOptions): ReactiveStream<V> {
  const lazy = options.lazy ?? `initial`;
  const onStop = options.onStop ?? (() => { /* no-op*/ })
  const onStart = options.onStart ?? (() => {/* no-op*/ })

  const events = initStream<V>({
    ...options,
    onFirstSubscribe() {
      if (lazy !== `never`) onStart();
    },
    onNoSubscribers() {
      if (lazy === `very`) onStop();
    },
  });
  if (lazy === `never`) onStart();
  return events;
}
/**
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
    if (disposed) throw new Error(`Disposed, cannot subscribe`);
    if (dispatcher === undefined) dispatcher = new DispatchList();
    const id = dispatcher.add(handler);
    emptySubscriptions = false;
    if (!firstSubscribe) {
      firstSubscribe = true;
      if (onFirstSubscribe) setTimeout(() => { onFirstSubscribe() }, 10);
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
    reset: () => {
      dispatcher?.clear();
      isEmpty();
    },
    set: (v: V) => {
      if (disposed) throw new Error(`Disposed, cannot set`);
      dispatcher?.notify({ value: v });
    },
    through: (pass: Passed<V>) => {
      if (disposed) throw new Error(`Disposed, cannot through`);
      dispatcher?.notify(pass)
    },
    signal: (signal: SignalKinds, context?: string) => {
      if (disposed) throw new Error(`Disposed, cannot signal`);
      dispatcher?.notify({ signal, value: undefined, context });
    },
    on: (handler: Dispatch<Passed<V>>) => subscribe(handler),
    value: (handler: (value: V) => void) => {
      const unsub = subscribe(message => {
        if (messageHasValue(message)) {
          handler(message.value);
        }
      });
      return unsub;
    }
  }
}
