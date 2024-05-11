import { initUpstream } from "../InitStream.js";
import { resolveSource } from "../ResolveSource.js";
import type { ReactiveOrSource, ReactiveStream, Reactive } from "../Types.js";
import type { SplitOptions } from "./Types.js";

/**
 * Creates a set of streams each of which receives data from `source`.
 * By default these are lazy and dispose if the upstream source closes.
 * 
 * See also {@link splitLabelled} to split into named streams.
 * @param source 
 * @param quantity 
 * @returns 
 */
export const split = <T>(r: ReactiveOrSource<T>, options: Partial<SplitOptions> = {}) => {
  const quantity = options.quantity ?? 2;
  const outputs: Array<ReactiveStream<T>> = [];
  const source = resolveSource(r);
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
 * const [a,b,c] = splitLabelled(source, `a`, `b`, `c`);
 * // a, b, c are Reactive types
 * ```
 * 
 * See also {@link split} to get an unlabelled split
 * @param source 
 * @param labels 
 * @returns 
 */
export const splitLabelled = <T, K extends PropertyKey>(r: ReactiveOrSource<T>, labels: Array<K>): Record<K, Reactive<T>> => {
  const source = resolveSource(r);
  const t: Partial<Record<K, Reactive<T>>> = {}
  for (const label of labels) {
    t[ label ] = initUpstream(source, { lazy: `initial`, disposeIfSourceDone: true });
  }
  return t as Record<K, Reactive<T>>;
}