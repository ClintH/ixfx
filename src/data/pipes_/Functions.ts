// /**
//  * Functions which operate on existing pipes
//  */

// import type { InOut, Signal } from "./Signal.js";
// import type { IWriteable } from "./Types.js";

// /**
//  * Inserts `insertPipe` between output of `sourcePipe` and its existing downstream pipe.
//  * Assumes `sourcePipe` is already connected to something - if it's not, it's the same as `connect`.
//  * @param sourcePipe 
//  * @param interceptingPipe 
//  */
// // export const insert = <V>(sourcePipe: IReadable<V>, insertPipe: PipeBidi<V>) => {
// //   const existingOutlet = sourcePipe.getOutlet();
// //   sourcePipe.setOutlet(insertPipe);
// //   if (existingOutlet) insertPipe.setOutlet(existingOutlet);
// // }

// /**
//  * Send the same value to several pipes
//  * @param value 
//  * @param pipes 
//  */
// export const push = <V>(value: InOut<V>, ...pipes: Array<IWriteable<V>>) => {
//   for (const pipe of pipes) {
//     pipe.push(value);
//   }
// }

// export const signal = (pipe: IWriteable<any>, signal: Signal) => {
//   pipe.signal(signal);
// }