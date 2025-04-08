/* eslint-disable @typescript-eslint/unbound-method */
import type { Reactive, ReactiveStream } from "./types.js";

/***
 * Returns a read-only version of `stream`
 */
export const toReadable = <V>(stream: ReactiveStream<V>): Reactive<V> => ({
  on: stream.on,
  dispose: stream.dispose,
  isDisposed: stream.isDisposed,
  onValue: stream.onValue
});
