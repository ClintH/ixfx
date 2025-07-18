/* eslint-disable @typescript-eslint/unbound-method */
import { initStream } from "../init-stream.js";
import type { PipeSet, Reactive, Passed } from "../types.js";
import { messageHasValue, messageIsDoneSignal } from "../util.js";

/**
 * Pipes the output of one stream into another, in order.
 * The stream returned is a new stream which captures the final output.
 * 
 * If any stream in the pipe closes the whole pipe is closed.
 * @param streams 
 * @returns 
 */
export const pipe = <TInput, TOutput>(...streams: PipeSet<TInput, TOutput>): Reactive<TOutput> => {
  const event = initStream<TOutput>();
  const unsubs: (() => void)[] = [];
  const performDispose = (reason: string) => {
    for (const s of streams) {
      if (!s.isDisposed) s.dispose(reason);
    }
    for (const s of unsubs) {
      s();
    }
    event.dispose(reason);
  }

  for (let index = 0; index < streams.length; index++) {
     
    unsubs.push(streams[ index ].on((message: Passed<unknown>) => {
      const isLast = index === streams.length - 1;
      if (messageHasValue(message)) {
        if (isLast) {
          // Last stream, send to output
          event.set(message.value as TOutput);
        } else {
          // @ts-expect-error
           
          streams[ index + 1 ].set(message.value);
        }
      } else if (messageIsDoneSignal(message)) {
        performDispose(`Upstream disposed`);
      }
    }));
  }
  return {
    on: event.on,
    onValue: event.onValue,
    dispose(reason) {
      performDispose(reason);
    },
    isDisposed() {
      return event.isDisposed();
    },
  };
}