import { initStream } from "../init-stream.js";
import { resolveSource } from "../resolve-source.js";
import type { ValueToPingOptions } from "../from/types.js";
import type { Reactive, ReactiveOrSource, ReactivePingable, Unsubscriber } from "../types.js";
import { messageHasValue, messageIsDoneSignal, messageIsSignal } from "../util.js";

/**
 * Pings `target` whenever `source` emits a value. The value itself is ignored, it just
 * acts as a trigger.
 * 
 * Returns a new stream capturing the output of `target`.
 * 
 * It `source` or `target` closes, output stream closes too.
 * 
 * @returns 
 */
export function valueToPing<TSource, TTarget>(source: ReactiveOrSource<TSource>, target: ReactivePingable<TTarget>, options: Partial<ValueToPingOptions<TSource>> = {}): Reactive<TTarget> {
  const lazy = options.lazy ?? `initial`;
  const signal = options.signal;
  const sourceRx = resolveSource(source);
  const gate = options.gate ?? ((value: TSource) => true);
  let upstreamOff: Unsubscriber | undefined;
  let downstreamOff: Unsubscriber | undefined;

  if (signal) {
    signal.addEventListener(`abort`, () => {
      done(`Abort signal ${ signal.reason }`);
    }, { once: true });
  }

  const events = initStream<TTarget>({
    onFirstSubscribe() {
      if (lazy !== `never` && upstreamOff === undefined) start();
    },
    onNoSubscribers() {
      // Unsubscribe from source if we're very lazy
      // Stay subscribed if we're only initially lazy or not lazy at all
      if (lazy === `very` && upstreamOff !== undefined) {
        upstreamOff();
        upstreamOff = undefined;
      }
    },
  })

  const start = () => {
    //console.log(`Rx.valueToPing  start`);

    upstreamOff = sourceRx.on(message => {
      if (messageIsDoneSignal(message)) {
        done(`Upstream closed`);
      } else if (messageIsSignal(message)) {
        events.signal(message.signal);
      } else if (messageHasValue(message)) {
        //console.log(`Rx.valueToPing got value: ${ message.value }`);
        if (gate(message.value)) {
          target.ping();
        }
      }
    });
    downstreamOff = target.on(message => {
      if (messageIsDoneSignal(message)) {
        done(`Downstream closed`);
      } else if (messageIsSignal(message)) {
        events.signal(message.signal, message.context);
      } else if (messageHasValue(message)) {
        events.set(message.value);
      }
    });
  }

  const done = (reason: string) => {
    events.dispose(reason);
    if (upstreamOff) upstreamOff();
    if (downstreamOff) downstreamOff();
  }

  if (lazy === `never`) start();
  return events;
}