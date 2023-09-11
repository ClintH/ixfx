/**
 * Functions which operate on existing pipes
 */

import type { InOut, Signal } from "../Signal.js";
import type { Readable, PipeBidi, Writeable } from "./Types.js";

/**
 * Inserts `insertPipe` between output of `sourcePipe` and its existing downstream pipe.
 * Assumes `sourcePipe` is already connected to something - if it's not, it's the same as `connect`.
 * @param sourcePipe 
 * @param interceptingPipe 
 */
export const insert = <V>(sourcePipe: Readable<V>, insertPipe: PipeBidi<V>) => {
  const existingOutlet = sourcePipe.getOutlet();
  sourcePipe.setOutlet(insertPipe);
  if (existingOutlet) insertPipe.setOutlet(existingOutlet);
}

/**
 * Send the same value to several pipes
 * @param value 
 * @param pipes 
 */
export const inlet = <V>(value: InOut<V>, ...pipes: Array<Writeable<V>>) => {
  for (const pipe of pipes) {
    pipe.inlet(value);
  }
}

export const signal = (pipe: Writeable<any>, signal: Signal) => {
  pipe.inlet([ undefined, signal ]);
}