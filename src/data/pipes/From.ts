
// export function from<V>(values: Map<any, V> | Array<V> | Iterable<V> | Generator<V> | AsyncGenerator<V>):PipeReadable<V> {
//   const pipe = bidi<V>();
//   toInlet(pipe, values);
//   return pipe;
// }

import type { Primitive } from "src/KeyValue.js";
import { bidi, type BidiOptions } from "./index.js";
import type { Readable, RxNumberRw } from "./Types.js";
import { feedIterable, feedPipes, type FeedOptions } from "./Feed.js";

/**
 * Creates a pipe, reading `values` into it
 * @param values 
 * @returns 
 */
export const array = <V>(values: Array<V>, options: FeedOptions = {}): Readable<V> => {
  const pipe = bidi<V>();
  feedIterable(pipe, values.values(), options);
  return pipe;
}

export const callback = <ResultValue, EventArguments>(computeValue: (data: EventArguments) => ResultValue): [ pipe: Readable<ResultValue>, listener: (args: EventArguments) => unknown ] => {
  const pipe = bidi<ResultValue>();
  const listener = (args: EventArguments) => {
    pipe.inlet([ computeValue(args), undefined ]);
  }
  return [ pipe, listener ];
}

/**
 * Emits a value when a listener is called
 * 
 * @example Emits _true_ every click happens
 * ```js
 * const [pipe,listener] = fromTrigger(true);
 * document.addEventListener(`click`, listener);
 * ```
 * 
 * @example Emits {width,height} every time resize happens
 * ```js
 * const computeValue = () => ({ width: window.innerWidth, height: window.innerHeight });
 * const [pipe,listener] = fromTrigger(computeValue);
 * document.addEventListener(`resize`, listener);
 * ```
 * @param computeValue Function that returns a value, or the value to emit
 * @param opts 
 * @returns 
 */
export const trigger = <ResultValue extends Primitive | object>(computeValue: ResultValue | (() => ResultValue), opts: BidiOptions<ResultValue> = {}): [ pipe: Readable<ResultValue>, listener: () => unknown ] => {
  const pipe = bidi<ResultValue>(opts);
  // TODO: Non-function type for ResultValue extends... ?
  const listener = () => {
    if (typeof computeValue === `function`) {
      pipe.inlet(computeValue());
    } else {
      pipe.inlet([ computeValue, undefined ]);
    }
  }

  if (opts.primeOutlet) listener();
  return [ pipe, listener ];
}

export const number = (initialValue: RxNumberRw | number): RxNumberRw => {
  return typeof initialValue === `number` ? bidi({ initialValue, primeOutlet: true }) : initialValue;
}

export const event = <V extends Event>(eventObject: EventTarget, eventName: string): Readable<V> => {
  let disposed = false;
  const pipe = bidi<V>({
    signalHandler: (signal) => {
      if (signal.type === `dispose` && !disposed) {
        // @ts-expect-error
        eventObject.removeEventListener(eventName, listener);
        disposed = true;
        return true;
      }
      return false;
    }
  });

  const listener = (args: V) => {
    pipe.inlet([ args, undefined ]);
  }

  if (`addEventListener` in eventObject) {
    // @ts-expect-error
    eventObject.addEventListener(eventName, listener);
  } else {
    throw new Error(`eventObject does not have 'addEventListener' as expected`);
  }

  return pipe;
}

/**
 * Join all the input pipes into one new output pipe.
 * 
 * If all input pipes close, output pipe also closes.
 * @param inputPipes 
 * @returns 
 */
export const pipes = (...inputPipes: Array<Readable<any>>) => {
  const b = bidi<any>();
  feedPipes(b, inputPipes, { close: `all` });
  return b;
}
