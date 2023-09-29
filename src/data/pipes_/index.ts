// /* eslint-disable unicorn/prevent-abbreviations */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-empty-function */
// //import type { Primitive, StringOrNumber } from "../../KeyValue.js";
// //import { average as NumericArrayAverage } from "../../collections/NumericArrays.js";
// import { intervalToMs, type Interval } from "../../flow/Interval.js";

// //import { count } from "../../Generators.js";
// //import { getErrorMessage } from "../../Debug.js";

// import * as Signals from './Signal.js';
// import type { Signal, InOut } from "./Signal.js";

// import type { OutletCallback, PipeBidi, IReadable, SubscribeOptions, IWriteable } from "./Types.js";
// import * as As from "./As.js";
// import * as Ops from './Ops.js';
// import * as From from './From.js';

// import type { Rect } from "src/geometry/Rect.js";

// export * as Fns from './Functions.js';
// export * as As from "./As.js";
// export * as Ops from './Ops.js';
// export * as From from './From.js';
// export * as Feed from './Feed.js';

// export * from './Types.js';
// // export const NullSink = (_: any) => {
// //   /** no-op */
// // }

// export const LogSink = (value: any, signal?: Signal) => {
//   if (signal) {
//     console.log(`Pipes.LogSink value: ${ JSON.stringify(value) } signal: ${ JSON.stringify(signal) }`);
//   } else {
//     console.log(`Pipes.LogSink value: ${ JSON.stringify(value) }`);
//   }
// }

// export type RxWindowOptions = {
//   throttle?: Interval
// }

// // export type SerialArguments<In, Out> = [
// //   IReadable<In>,
// //   ...Array<Ops.Op<In, Out> | Ops.Op<In, In>>
// // ]

// // export const serial = <In, Out>(...pipes: SerialArguments<In, Out>): IWriteable<In> & IReadable<Out> => {
// //   let last: IReadable<In> | IReadable<Out> | undefined;
// //   let first: IReadable<In> | undefined;

// //   for (const p of pipes) {
// //     if (last === undefined) last = p as IReadable<In>;
// //     if (first === undefined) first = p as IReadable<In>
// //     else {
// //       const pp = p as Ops.Op<In, Out>;
// //       if (Ops.isOnePipeOp(pp)) {
// //         last = pp(last as IReadable<In>);
// //       } else {
// //         console.log(p);
// //         throw new Error(`Unknown pipe`);
// //       }
// //     }
// //   }
// //   if (last === undefined) throw new Error(`No pipes`);

// //   const result: IWriteable<In> & IReadable<Out> = {
// //     getOutlet() {
// //       return first?.getOutlet;
// //     },
// //     inlet(value) {
// //       if (first === undefined) throw new Error(`No first pipe`);
// //       if (`inlet` in first) {
// //         (first as IWriteable<In>).inlet(value);
// //       } else if (value[ 1 ] !== undefined) {
// //         first.signal(value[ 1 ]);
// //       }
// //     },
// //     last() {
// //       if (last === undefined) throw new Error(`No pipes`);
// //       return last.last() as Out | undefined;
// //     },
// //     setOutlet(callback, setOpts) {
// //       if (last === undefined) throw new Error(`No pipes`);
// //       (last as Readable<Out>).setOutlet(callback, setOpts);
// //     },
// //     signal(signal) {
// //       if (first === undefined) throw new Error(`No first pipe`);
// //       first.signal(signal);
// //     },
// //   }
// //   return result;
// // }

// // export const rxWindow = (opts: RxWindowOptions = {}) => {
// //   const throttleMs = intervalToMs(opts.throttle, 500);

// //   // Resize pipeline
// //   const resize = compose<Event, Rect>(
// //     From.event(window, `resize`),
// //     Ops.throttle(throttleMs),
// //     Ops.emit<any, Rect>(() => {
// //       return { width: window.innerWidth, height: window.innerHeight }
// //     }, { when: `emit-signal` })
// //   );
// //   resize.signal({ source: `rx`, type: `emit` });

// //   const dispose = () => {
// //     resize.signal({ source: `rx`, type: `dispose` });
// //   }

// //   return {
// //     size: As.basic<Rect>(resize, true),
// //     dispose
// //   }
// // }


// /**
//  *
//  *  const dataStream = new DataStream();
//  *  dataStream.in({ key: `x`, value: 0.5 });
//  *  const label = (obj:any) => {
//  *    if (`key` in obj) return obj;
//  *    return { key: randomKey(), ...obj }
//  *  }
//  *  const stream = pipeline(dataStream, label);
//  *  // Actively compute size of window based on window width
//  *  const windowSize = ops.divide(rxWindow.innerWidth, pointSize);
//  *  const dataWindow = window(stream, windowSize);
//  *  const dataToPoints = (value);
//  *
//  *  const drawPlot = (dataWindow) => {
//  *    for (const dataPoint in dataWindow) {
//  *    }
//  *  }
//  */

