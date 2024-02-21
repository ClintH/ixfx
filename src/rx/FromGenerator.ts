/* eslint-disable @typescript-eslint/unbound-method */
import { initStream } from "./InitStream.js";
import type { GeneratorOptions, InitStreamOptions, Reactive, ReactiveDisposable } from "./Types.js";

/**
 * Creates a readable reactive based on a generator
 * ```js
 * // Generators that makes a random value every 5 seconds
 * const valuesOverTime = Flow.interval(() => Math.random(), 5000);
 * // Wrap the generator
 * const r = Reactive.generator(time);
 * // Get notified when there is a new value
 * r.on(v => {
 *   console.log(v.value);
 * });
 * ```
 * @param generator 
 */
export function generator<V>(generator: IterableIterator<V> | AsyncIterableIterator<V> | Generator<V> | AsyncGenerator<V>, options: Partial<GeneratorOptions> = {}): ReactiveDisposable & Reactive<V> {
  const lazy = options.lazy ?? true;
  let reading = false;

  const eventOpts: InitStreamOptions = {
    onFirstSubscribe() {
      if (lazy && !reading) {
        readingStart();
      }
    },
    onNoSubscribers() {
      if (lazy && reading) {
        reading = false;
      }
    },
  }
  const events = initStream<V>(eventOpts);

  const read = async () => {
    try {
      const v = await generator.next();
      if (v.done) {
        events.dispose(`Generator complete`);
        return;
      }
      if (!reading) return;
      events.set(v.value);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      events.dispose(`Generator error: ${ (error as any).toString() }`);
      return;
    }
    if (events.isDisposed()) return;
    if (!reading) return;
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setTimeout(read);
  }

  const readingStart = () => {
    if (reading) return;
    reading = true;
    void read();
  }
  if (!lazy) readingStart();

  return {
    on: events.on,
    value: events.value,
    dispose: events.dispose,
    isDisposed: events.isDisposed
  }
}
