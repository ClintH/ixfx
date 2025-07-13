import { resolveSource } from "./resolve-source.js";
import type { ReactiveOrSource } from "./types.js";
import { messageHasValue, messageIsDoneSignal } from "./util.js";

/**
 * Returns an AsyncGenerator wrapper around Reactive.
 * This allows values to be iterated over using a `for await` loop,
 * like Chains.
 *
 * ```js
 * // Reactive numerical value
 * const number = Reactive.number(10);
 * 
 * const g = Reactive.toGenerator(number);
 * for await (const v of g) {
 *  console.log(v); // Prints out whenever the reactive value changes
 * }
 * // Execution doesn't continue until Reactive finishes
 * ```
 * 
 * When/if `source` closes, an exception is thrown.
 * To catch this, wrap the calling `for await` in a try-catch block
 * ```js
 * try {
 *  for await (const v of g) {
 *  }
 * } catch (error) {
 * }
 * // Completed
 * ``` 
 * 
 * Use something like `setTimeout` to loop over the generator
 * without impeding the rest of your code flow. For example:
 * ```js
 * // Listen for every pointerup event
 * const ptr = Reactive.fromEvent(document.body, `pointerup`);
 * // Start iterating
 * setTimeout(async () => {
 *  const gen = Reactive.toGenerator(ptr);
 *  try {
 *    for await (const v of gen) {
 *      // Prints out whenever there is a click
 *      console.log(v);
 *    }
 *  } catch (e) { }
 *  console.log(`Iteration done`);
 * });
 * 
 * // Execution continues here immediately
 * ```
 * @param source 
 */
export async function* toGenerator<V>(source: ReactiveOrSource<V>): AsyncGenerator<V> {
  const s = resolveSource(source);
  let promiseResolve: ((value: V | PromiseLike<V>) => void) = (_) => {/** noop */ };
  let promiseReject: ((reason: string) => void) = (_) => {/** no-op */ }

  const promiseInit = () => (new Promise<V>((resolve, reject) => {
    promiseResolve = resolve;
    promiseReject = reject;
  }));
  let promise = promiseInit();
  let keepRunning = true;

  s.on(message => {
    if (messageHasValue(message)) {
      promiseResolve(message.value);
      promise = promiseInit();
    } else if (messageIsDoneSignal(message)) {
      keepRunning = false;
      promiseReject(`Source has completed`);
    }
  });

  while (keepRunning) {
    yield await promise;
  }
}
