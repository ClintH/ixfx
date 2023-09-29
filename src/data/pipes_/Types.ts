// import type { InOut, Signal } from "./Signal.js";

// export type OutletCallback<V> = (value: InOut<V>) => void;

// export type SubscribeOptions = {
//   /**
//    * If true, the last value of the pipe (if available) is sent to the outlet when connected.
//    */
//   primeOutlet?: boolean
//   once?: boolean
// }

// export type Subscription = {
//   id: string
//   source: IReadable<any>
// }

// // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
// export interface IReadable<V> {
//   subscribe: (callback: OutletCallback<V> | IWriteable<V>, setOpts?: SubscribeOptions) => Subscription
//   unsubscribe: (subscription: Subscription) => void
//   get last(): V | undefined
//   signal: (signal: Signal) => void
//   close(reason: string): void
//   get isClosed(): boolean
//   get isFinite(): boolean
// }


// // export function isFinitePipe(p: IReadable<any> | IWriteable<any> | IFinite): p is IFinite {
// //   return (`isClosed` in p);
// // }

// // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
// export interface IWriteable<V> {
//   push(value: InOut<V>): void
//   signal(signal: Signal): void
//   pushValue(value: V): void
// }

// export type PipeBidi<V> = IReadable<V> & IWriteable<V>;// & IFinite;

// export type PipeTransform<InputType, OutputType> = IReadable<OutputType> & IWriteable<InputType>;// & IFinite;

// export type NumberPipeBidi = PipeBidi<number>;
