// import type { IReadable } from "./Types.js"

// export type SignalError = {
//   type: `error`,
//   source: string,
//   message: string,
//   stack: unknown
// }

// export type Signal = {
//   type: `error` | `closed` | `trigger`
//   source: string
// }

// export type SignalClose = {
//   type: `closed`,
//   source: string
// }


// export type SignalTrigger = {
//   type: `trigger`,
//   source: string
// }

// export type InOut<V> = Readonly<[ value: V | undefined, signal: Signal | undefined, source: IReadable<V> ]>;

// export type InOutSignal<V> = Readonly<[ value: undefined, signal: Signal, source: IReadable<V> ]>;
// export type InOutValue<V> = [ value: V, signal: undefined, source: IReadable<V> ];

// export type InOutSignalClosed<V> = [ value: undefined, signal: SignalClose, source: IReadable<V> ];
// export type InOutSignalError<V> = [ value: undefined, signal: SignalError, source: IReadable<V> ];

// export type InOutEmpty<V> = Readonly<[ undefined, undefined, source: IReadable<V> ]>;


// export function isSignal<V>(v: InOut<V>): v is InOutSignal<V> {
//   if (v[ 0 ] !== undefined) return false;
//   if (v[ 1 ] === undefined) return false;
//   return true;
// }

// export function isValue<V>(v: InOut<V>): v is InOutValue<V> {
//   if (v[ 0 ] === undefined) return false;
//   if (v[ 1 ] !== undefined) return false;
//   return true;
// }

// export function isError<V>(v: InOut<V>): v is InOutSignalError<V> {
//   const [ _value, signal ] = v;
//   if (signal === undefined) return false;
//   return signal.type === `error`;
// }

// export function isClosed<V>(v: InOut<V>): v is InOutSignalClosed<V> {
//   const [ value, signal ] = v;
//   if (signal === undefined) return false;
//   if (value !== undefined) return false;
//   return (signal.type === `closed`)
// }


// export function isEmpty<V>(v: InOut<V>): v is InOutEmpty<V> {
//   return (v[ 0 ] === undefined && v[ 1 ] === undefined);
// }