import { generator } from "./FromGenerator.js";
import type { Reactive, ReactiveOrSource } from "./Types.js";

/**
 * Resolves various kinds of sources into a Reactive.
 * If `source` is an iterable/generator, it gets wrapped via `generator()`.
 * @param source 
 * @returns 
 */
export const resolveSource = <V>(source: ReactiveOrSource<V>): Reactive<V> => {
  if (`on` in source) return source;
  // eslint-disable-next-line unicorn/prefer-ternary
  if (Array.isArray(source)) {
    return generator(source.values(), { lazy: true });
  } else {
    return generator(source, { lazy: true });
  }
}