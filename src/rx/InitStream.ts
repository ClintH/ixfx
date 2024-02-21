import { type Dispatch, DispatchList } from "../flow/DispatchList.js";
import { resolveSource } from "./ResolveSource.js";
import type { InitStreamOptions, Passed, ReactiveOrSource, ReactiveStream, SignalKinds, UpstreamOptions } from "./Types.js";
import { messageHasValue, messageIsSignal } from "./Util.js";

/**
 * @ignore
 * @param upstreamSource 
 * @param options 
 * @returns 
 */
export const initUpstream = <In, Out>(upstreamSource: ReactiveOrSource<In>, options: Partial<UpstreamOptions<In>>) => {
  const lazy = options.lazy ?? true;
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
          if (disposeIfSourceDone) events.dispose(`Source is completed`);
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

  const initOpts: InitStreamOptions = {
    onFirstSubscribe() {
      if (lazy) start();
    },
    onNoSubscribers() {
      if (lazy) stop();
    },
  }
  if (!lazy) start();
  const events = initStream<Out>(initOpts);
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
    if (disposed) throw new Error(`Disposed`);
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
      //console.log(`initEvent:dispose (${ reason }) disposed: ${ disposed }`);
      if (disposed) return;
      dispatcher?.notify({ value: undefined, signal: `done`, context: `Disposed: ${ reason }` });
      disposed = true;
    },
    isDisposed: () => {
      return disposed
    },
    reset: () => {
      dispatcher?.clear();
      isEmpty();
    },
    set: (v: V) => {
      if (disposed) throw new Error(`Disposed`);
      dispatcher?.notify({ value: v });
    },
    through: (pass: Passed<V>) => {
      if (disposed) throw new Error(`Disposed`);
      dispatcher?.notify(pass)
    },
    signal: (signal: SignalKinds, context?: string) => {
      if (disposed) throw new Error(`Disposed`);
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
