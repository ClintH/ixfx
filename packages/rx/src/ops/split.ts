import { initUpstream } from "../init-stream.js";
import { resolveSource } from "../resolve-source.js";
import type { ReactiveOrSource, ReactiveStream, Reactive } from "../types.js";
import type { SplitOptions } from "./types.js";

/**
 * Creates a set of streams each of which receives data from `source`.
 * By default these are lazy and dispose if the upstream source closes.
 * 
 * See also {@link splitLabelled} to split into named streams.
 * @param rxOrSource 
 * @param options 
 * @returns 
 */
export const split = <T>(rxOrSource: ReactiveOrSource<T>, options: Partial<SplitOptions> = {}): ReactiveStream<T>[] => {
  const quantity = options.quantity ?? 2;
  const outputs: ReactiveStream<T>[] = [];
  const source = resolveSource(rxOrSource);
  for (let index = 0; index < quantity; index++) {
    outputs.push(initUpstream(source, { disposeIfSourceDone: true, lazy: `initial` }));
  }
  return outputs;
}

/**
 * Splits `source` into several duplicated streams. 
 * Returns an object with keys according to `labels`.
 * Each value is a stream which echos the values from `source`.
 * ```js
 * const { a, b, c} = splitLabelled(source, `a`, `b`, `c`);
 * // a, b, c are Reactive types
 * ```
 * 
 * See also {@link split} to get an unlabelled split
 * @param rxOrSource 
 * @param labels 
 * @returns 
 */
export const splitLabelled = <T, K extends PropertyKey>(rxOrSource: ReactiveOrSource<T>, labels: K[]): Record<K, Reactive<T>> => {
  const source = resolveSource(rxOrSource);
  const t: Partial<Record<K, Reactive<T>>> = {}
  for (const label of labels) {
    t[ label ] = initUpstream(source, { lazy: `initial`, disposeIfSourceDone: true });
  }
  return t as Record<K, Reactive<T>>;
}