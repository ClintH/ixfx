/* eslint-disable @typescript-eslint/unbound-method */
import { intervalToMs } from "../flow/IntervalType.js";
import { initLazyStream } from "./InitStream.js";
import type { FromGeneratorOptions, Reactive, ReactiveDisposable } from "./Types.js";

/**
 * Creates a readable reactive based on a (async)generator
 * ```js
 * // Generator a random value every 5 seconds
 * const valuesOverTime = Flow.interval(() => Math.random(), 5000);
 * // Wrap the generator
 * const r = Rx.fromGenerator(time);
 * // Get notified when there is a new value
 * r.value(v => {
 *   console.log(v);
 * });
 * ```
 * @param generator 
 */
export function fromGenerator<V>(generator: IterableIterator<V> | AsyncIterableIterator<V> | Generator<V> | AsyncGenerator<V>, options: Partial<FromGeneratorOptions> = {}): ReactiveDisposable & Reactive<V> {
  const lazy = options.lazy ?? `initial`;
  const signal = options.signal;
  const interval = intervalToMs(options.interval, 5);
  let reading = false;

  const events = initLazyStream<V>({
    ...options,
    lazy,
    onStart() {
      readingStart();
    },
    onStop() {
      reading = false;
    },
  });

  const read = async () => {
    try {
      if (signal?.aborted) {
        events.dispose(`Signalled (${ signal.reason })`);
        reading = false;
        return;
      }
      const v = await generator.next();
      //console.log(`fromGenerator: v ${ JSON.stringify(v) }`);
      if (v.done) {
        events.dispose(`Generator complete`);
        reading = false;
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
    setTimeout(read, interval);
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
