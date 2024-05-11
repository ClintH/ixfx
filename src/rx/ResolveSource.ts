import { isAsyncIterable, isIterable } from "../iterables/Iterable.js";
import { func } from "./sources/Function.js";
import { iterator } from "./sources/Iterator.js";
import type { GeneratorOptions, FunctionOptions } from "./sources/Types.js";
import type { Reactive, ReactiveOrSource } from "./Types.js";
import { isReactive, isWrapped } from "./Util.js";

export type ResolveSourceOptions = {
  /**
   * Options when creating a reactive from a generator
   * Default:  `{ lazy: true, interval: 5 }`
   */
  generator: GeneratorOptions
  /**
   * Options when creating a reactive from a function.
   */
  function: FunctionOptions
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
  const functionOptions = options.function ?? { lazy: `very` }
  // eslint-disable-next-line unicorn/prefer-ternary
  if (Array.isArray(source)) {
    return iterator(source.values(), generatorOptions);
  } else if (typeof source === `function`) {
    return func<V>(source, functionOptions)
  } else if (typeof source === `object`) {
    //console.log(`resolveSource is object`);
    if (isWrapped<V>(source)) {
      //console.log(`resolveSource is object - wrapped`);
      return source.source;
    }
    if (isIterable(source) || isAsyncIterable(source)) {
      //console.log(`resolveSource is object - iterable`);
      return iterator(source, generatorOptions);
    }
  }
  throw new TypeError(`Unable to resolve source. Supports: array, Reactive, Async/Iterable. Got type: ${ typeof source }`);
}