/* eslint-disable @typescript-eslint/unbound-method */
import type { ReactiveDisposable, ReactiveStream } from "./Types.js";

export const toReadable = <V>(upstream: ReactiveStream<V>): ReactiveDisposable<V> => ({
  on: upstream.on,
  dispose: upstream.dispose,
  isDisposed: upstream.isDisposed,
  value: upstream.value
});
