
// // export function from<V>(values: Map<any, V> | Array<V> | Iterable<V> | Generator<V> | AsyncGenerator<V>):PipeReadable<V> {
// //   const pipe = bidi<V>();
// //   toInlet(pipe, values);
// //   return pipe;
// // }

// import type { Primitive } from "src/KeyValue.js";
// import { Bidi, type BidiOptions } from "./Bidi.js";
// import type { IReadable, NumberPipeBidi } from "./Types.js";
// import { feedIterable, feedPipes, type FeedOptions } from "./Feed.js";
// import type { Signal } from "./Signal.js";

// /**
//  * Creates a pipe, reading `values` into it
//  * @param values 
//  * @returns 
//  */
// export const array = <V>(values: Array<V>, options: FeedOptions = {}): IReadable<V> => {
//   const pipe = new Bidi<V>();
//   feedIterable(pipe, values.values(), options);
//   return pipe;
// }

// export const callback = <ResultValue, EventArguments>(computeValue: (data: EventArguments) => ResultValue): [ pipe: IReadable<ResultValue>, listener: (args: EventArguments) => unknown ] => {
//   const pipe = new Bidi<ResultValue>();
//   const listener = (args: EventArguments) => {
//     pipe.pushValue(computeValue(args));
//   }
//   return [ pipe, listener ];
// }

// /**
//  * Emits a value when a listener is called
//  * 
//  * @example Emits _true_ every click happens
//  * ```js
//  * const [pipe,listener] = fromTrigger(true);
//  * document.addEventListener(`click`, listener);
//  * ```
//  * 
//  * @example Emits {width,height} every time resize happens
//  * ```js
//  * const computeValue = () => ({ width: window.innerWidth, height: window.innerHeight });
//  * const [pipe,listener] = fromTrigger(computeValue);
//  * document.addEventListener(`resize`, listener);
//  * ```
//  * @param computeValue Function that returns a value, or the value to emit
//  * @param opts 
//  * @returns 
//  */
// export const trigger = <ResultValue extends Primitive | object>(computeValue: ResultValue | (() => ResultValue), opts: BidiOptions<ResultValue> = {}): [ pipe: IReadable<ResultValue>, listener: () => unknown ] => {
//   const pipe = new Bidi<ResultValue>(opts);
//   // TODO: Non-function type for ResultValue extends... ?
//   const listener = () => {
//     if (typeof computeValue === `function`) {
//       pipe.pushValue(computeValue());
//     } else {
//       pipe.pushValue(computeValue);
//     }
//   }

//   if (opts.primeOutlet) listener();
//   return [ pipe, listener ];
// }

// /**
//  * Returns a 'number pipe', wrapping `initialValue`. If `initialValue` is already a pipe, it is returned.
//  * @param initialValue 
//  * @returns 
//  */
// export const number = (initialValue: NumberPipeBidi | number): NumberPipeBidi => {
//   return typeof initialValue === `number` ? new Bidi<number>({ initialValue, primeOutlet: true }) : initialValue;
// }

// /**
//  * Create a pipe from an event target
//  * @param eventTarget 
//  * @param eventName 
//  * @returns 
//  */
// export const event = <V extends Event>(eventTarget: EventTarget, eventName: string): IReadable<V> => {
//   let disposed = false;

//   const signalIntercept = (signal: Signal) => {
//     if (signal.type === `closed` && !disposed) {
//       console.log(`From.event - disposed. Removing event listener`);
//       // @ts-expect-error
//       eventTarget.removeEventListener(eventName, listener);
//       disposed = true;
//       return true;
//     }
//     return false;
//   }

//   const pipe = new Bidi<V>({ signalIntercept });

//   const listener = (args: V) => { pipe.pushValue(args) };

//   if (`addEventListener` in eventTarget) {
//     // @ts-expect-error
//     eventTarget.addEventListener(eventName, listener);
//   } else {
//     throw new Error(`eventObject does not have 'addEventListener' as expected`);
//   }

//   return pipe;
// }

// /**
//  * Join all the input pipes into one new output pipe.
//  * 
//  * If all input pipes close, output pipe also closes.
//  * @param inputPipes 
//  * @returns 
//  */
// export const pipes = (...inputPipes: Array<IReadable<any>>) => {
//   const b = new Bidi<any>();
//   feedPipes(b, inputPipes, { close: `all` });
//   return b;
// }
