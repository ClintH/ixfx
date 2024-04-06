import type { Interval } from "../flow/IntervalType.js";
import { isAsyncIterable, isIterable } from "../iterables/Iterable.js";
import { fromGenerator } from "./FromGenerator.js";
import type { FromGeneratorOptions, Reactive, ReactiveOrSource } from "./Types.js";
import { isReactive } from "./Util.js";

export type ResolveSourceOptions = {
  /**
   * Options when creating a reactive from a generator
   * Default:  `{ lazy: true, interval: 5 }`
   */
  generator: FromGeneratorOptions
}

/**
 * Resolves various kinds of sources into a Reactive.
 * If `source` is an iterable/generator, it gets wrapped via `generator()`.
 * 
 * Default options:
 * * generator: `{ lazy: true, interval: 5 }`
 * @param source 
 * @returns 
 */
export const resolveSource = <V>(source: ReactiveOrSource<V>, options: Partial<ResolveSourceOptions> = {}): Reactive<V> => {
  if (isReactive(source)) return source;
  const generatorOptions = options.generator ?? { lazy: `initial`, interval: 5 }

  // eslint-disable-next-line unicorn/prefer-ternary
  if (Array.isArray(source)) {
    return fromGenerator(source.values(), generatorOptions);
  } else {
    if (`source` in source && `toArrayOrThrow` in source) {
      return source.source;
    }
    if (isIterable(source) || isAsyncIterable(source)) {
      return fromGenerator(source, generatorOptions);
    }
  }
  throw new Error(`Unable to resolve source. Supports: array, Reactive, Async/Iterable. Got type: ${ typeof source }`);
}