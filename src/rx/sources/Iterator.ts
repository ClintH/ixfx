/* eslint-disable @typescript-eslint/unbound-method */
import { nextWithTimeout } from "../../iterables/IterableAsync.js";
import { intervalToMs } from "../../flow/IntervalType.js";
import { initLazyStream } from "../InitStream.js";
import { isAsyncIterable } from "../../iterables/Iterable.js";
import type { Reactive } from "../Types.js";
import type { GeneratorOptions } from "./Types.js";
import { StateMachine } from "../../flow/index.js";

/**
 * Creates a Reactive from an AsyncGenerator or Generator
 * @param gen 
 * @returns 
 */
// export function readFromGenerator<V>(gen: AsyncGenerator<V> | Generator<V>) {
//   const rx = initStream<V>();
//   // eslint-disable-next-line @typescript-eslint/no-misused-promises
//   setTimeout(async () => {
//     try {
//       for await (const value of gen) {
//         rx.set(value);
//       }
//       rx.dispose(`Source generator complete`);
//     } catch (error) {
//       console.error(error);
//       rx.dispose(`Error while iterating`);
//     }
//   }, 1);
//   return rx;
// }

/**
 * Creates a readable reactive based on a (async)generator or iterator
 * ```js
 * // Generator a random value every 5 seconds
 * const valuesOverTime = Flow.interval(() => Math.random(), 5000);
 * // Wrap the generator
 * const r = Rx.From.iterator(time);
 * // Get notified when there is a new value
 * r.onValue(v => {
 *   console.log(v);
 * });
 * ```
 * 
 * Awaiting values could potentially hang code. Thus there is a `readTimeout`, the maximum time to wait for a value from the generator. Default: 5 minutes.
 * If `signal` is given, this will also cancel waiting for the value.
 * @param source 
 */
export function iterator<V>(source: IterableIterator<V> | Array<V> | AsyncIterableIterator<V> | Generator<V> | AsyncGenerator<V>, options: Partial<GeneratorOptions> = {}): Reactive<V> {
  const lazy = options.lazy ?? `very`;
  const log = options.traceLifecycle ? (message: string) => { console.log(`Rx.From.iterator ${ message }`); } : (_: string) => {/* no-up */ }

  const readIntervalMs = intervalToMs(options.readInterval, 5);
  const readTimeoutMs = intervalToMs(options.readTimeout, 5 * 60 * 1000);
  const whenStopped = options.whenStopped ?? `continue`;

  let iterator: IterableIterator<V> | AsyncIterableIterator<V> | undefined;
  //let reading = false;
  let ourAc: AbortController | undefined;
  let sm = StateMachine.init({
    idle: [ `wait_for_next` ],
    wait_for_next: [ `processing_result`, `stopping`, `disposed` ],
    processing_result: [ `queued`, `disposed`, `stopping` ],
    queued: [ `wait_for_next`, `disposed`, `stopping` ],
    stopping: `idle`,
    // eslint-disable-next-line unicorn/no-null
    disposed: null
  }, `idle`);

  const onExternalSignal = () => {
    log(`onExternalSignal`);
    ourAc?.abort(options.signal?.reason);
  }
  if (options.signal) {
    options.signal.addEventListener(`abort`, onExternalSignal, { once: true });
  };

  const read = async () => {
    log(`read. State: ${ sm.value }`);
    ourAc = new AbortController();
    try {
      sm = StateMachine.to(sm, `wait_for_next`);
      // @ts-expect-error
      const v = await nextWithTimeout(iterator, { signal: ourAc.signal, millis: readTimeoutMs });
      sm = StateMachine.to(sm, `processing_result`);
      ourAc?.abort(`nextWithTimeout completed`);

      if (v.done) {
        log(`read v.done true`);
        events.dispose(`Generator complete`);
        //reading = false;
        sm = StateMachine.to(sm, `disposed`);
      }
      //if (!reading) return;
      if (sm.value === `stopping`) {
        log(`read. sm.value = stopping`)
        sm = StateMachine.to(sm, `idle`);
        return;
      }
      if (sm.value === `disposed`) {
        log(`read. sm.value = disposed`);
        return;
      }
      events.set(v.value);

    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      events.dispose(`Generator error: ${ (error as any).toString() }`);
      return;
    }
    //if (events.isDisposed()) return;
    //if (!reading) return;

    if (sm.value === `processing_result`) {
      sm = StateMachine.to(sm, `queued`);
      log(`scheduling read. State: ${ sm.value }`);
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      setTimeout(read, readIntervalMs);
    } else {
      sm = StateMachine.to(sm, `idle`);
    }
  }

  const events = initLazyStream<V>({
    ...options,
    lazy,
    onStart() {
      log(`onStart state: ${ sm.value } whenStopped: ${ whenStopped }`);
      if (sm.value !== `idle`) return;
      if ((sm.value === `idle` && whenStopped === `reset`) || iterator === undefined) {
        iterator = isAsyncIterable(source) ? source[ Symbol.asyncIterator ]() : source[ Symbol.iterator ]();
      }
      //reading = true;
      void read();
    },
    onStop() {
      log(`onStop state: ${ sm.value } whenStopped: ${ whenStopped }`);
      //reading = false;
      sm = StateMachine.to(sm, `stopping`);
      if (whenStopped === `reset`) {
        log(`onStop reiniting iterator`);
        iterator = isAsyncIterable(source) ? source[ Symbol.asyncIterator ]() : source[ Symbol.iterator ]();
      }
    },
    onDispose(reason: string) {
      log(`onDispose (${ reason })`);
      ourAc?.abort(`Rx.From.iterator disposed (${ reason })`);
      if (options.signal) options.signal.removeEventListener(`abort`, onExternalSignal);
    },
  });

  // const readingStart = () => {

  // }
  //if (!lazy) readingStart();

  // return {
  //   on: events.on,
  //   value: events.value,
  //   dispose: events.dispose,
  //   isDisposed: events.isDisposed
  // }
  return events;
}
