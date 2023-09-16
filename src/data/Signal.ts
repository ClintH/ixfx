
export type SignalError = {
  type: `error`,
  source: string,
  message: string,
  stack: unknown
}

export type Signal = {
  type: string
  source: string
}

export type SignalClose = {
  type: `closed`,
  source: string
}

export type SigalTrigger = {
  type: `trigger`,
  source: string
}

export const close = (source: string): InOutSignalClosed => ([ undefined, { type: `closed`, source } ]);

export const error = (message: string, source: string, stack: unknown): InOutSignalError => ([ undefined, { type: `error`, message, source, stack } ]);

export type InOut<V> = Readonly<[ value: V | undefined, signal: Signal | undefined ]>;

export type InOutSignal = Readonly<[ value: undefined, signal: Signal ]>;
export type InOutValue<V> = [ value: V, signal: undefined ];

export type InOutSignalClosed = [ value: undefined, signal: SignalClose ];
export type InOutSignalError = [ value: undefined, signal: SignalError ];

export type InOutEmpty = Readonly<[ undefined, undefined ]>;
export const emptyInOut: InOutEmpty = [ undefined, undefined ] as const;

export function isSignal<V>(v: InOut<V>): v is InOutSignal {
  if (v[ 0 ] !== undefined) return false;
  if (v[ 1 ] === undefined) return false;
  return true;
}

export function isValue<V>(v: InOut<V>): v is InOutValue<V> {
  if (v[ 0 ] === undefined) return false;
  if (v[ 1 ] !== undefined) return false;
  return true;
}

export function isError(v: InOut<any>): v is InOutSignalError {
  const [ _value, signal ] = v;
  if (signal === undefined) return false;
  return signal.type === `error`;
}

export function isClosed<V>(v: InOut<V>): v is InOutSignalClosed {
  const [ value, signal ] = v;
  if (signal === undefined) return false;
  if (value !== undefined) return false;
  return (signal.type === `closed`)
}

export function isEmpty(v: InOut<any>): v is InOutEmpty {
  return (v[ 0 ] === undefined && v[ 1 ] === undefined);
}