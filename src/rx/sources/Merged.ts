import { initLazyStream } from "../InitStream.js";
import type { InitLazyStreamOptions, Reactive, Unsubscriber } from "../Types.js";

/**
 * Returns a stream that merges the output of a list of homogenous streams.
 * Use {@link mergedWithOptions} to specify additional options.
 * @param sources 
 * @returns 
 */
export function merged<T>(...sources: Reactive<T>[]): Reactive<T> {
  return mergedWithOptions(sources);
}

/**
 * Returns a stream that merges the output of a list of homogenous streams.
 * 
 * @param sources 
 * @param options 
 * @returns 
 */
export function mergedWithOptions<T>(sources: Reactive<T>[], options: Partial<InitLazyStreamOptions> = {}): Reactive<T> {
  let unsubs: Unsubscriber[] = [];
  const stream = initLazyStream<T>({
    ...options,
    onStart() {
      for (const s of sources) {
        unsubs.push(s.onValue(v => {
          stream.set(v);
        }));
      }
    },
    onStop() {
      for (const un of unsubs) {
        un();
      }
      unsubs = [];
    },
  });
  return stream;
}