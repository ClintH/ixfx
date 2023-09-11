import type { InOut, Signal } from "../Signal.js";

export type OutletCallback<V> = (value: InOut<V>) => void;

export type SetOutletOptions = {
  /**
   * If true, the last value of the pipe (if available) is sent to the outlet when connected.
   */
  primeOutlet?: boolean
}

export type Readable<V> = {
  setOutlet: (callback: OutletCallback<V> | Writeable<V>, setOpts?: SetOutletOptions) => void
  getOutlet: () => OutletCallback<V> | undefined
  last: () => V | undefined
  signal: (signal: Signal) => void
}

export type Finite = {
  isClosed: () => boolean
}

export function isFinitePipe(p: Readable<any> | Writeable<any> | Finite): p is Finite {
  return (`isClosed` in p);
}

export type Writeable<V> = {
  inlet: (value: InOut<V>) => void
}

export type PipeBidi<V> = Readable<V> & Writeable<V> & Finite;
export type PipeTransform<InputType, OutputType> = Readable<OutputType> & Writeable<InputType> & Finite;

//export type NumberPipe = PipeBidi<number>;
export type RxNumberRw = PipeBidi<number>;
