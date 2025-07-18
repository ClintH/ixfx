/* eslint-disable @typescript-eslint/unbound-method */
import { initStream } from "../init-stream.js";
import type { ReactiveWritable, ReactiveInitial, ReactiveNonInitial } from "../types.js";

export function number(initialValue: number): ReactiveWritable<number> & ReactiveInitial<number>;
export function number(): ReactiveWritable<number> & ReactiveNonInitial<number>;
export function number(initialValue?: number): ReactiveWritable<number> & (ReactiveNonInitial<number> | ReactiveInitial<number>) {
  let value = initialValue;
  const events = initStream<number>();

  const set = (v: number) => {
    value = v;
    events.set(v);
  }

  return {
    dispose: events.dispose,
    isDisposed: events.isDisposed,
    last: () => value,
    on: events.on,
    onValue: events.onValue,
    set
  }
}
