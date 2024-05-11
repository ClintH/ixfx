/* eslint-disable @typescript-eslint/unbound-method */
import { initStream } from "../InitStream.js";
import type { ReactiveDisposable, ReactiveWritable, ReactiveInitial, ReactiveNonInitial } from "../Types.js";

export function number(initialValue: number): ReactiveDisposable<number> & ReactiveWritable<number> & ReactiveInitial<number>;
export function number(): ReactiveDisposable<number> & ReactiveWritable<number> & ReactiveNonInitial<number>;
export function number(initialValue?: number): ReactiveDisposable<number> & ReactiveWritable<number> & (ReactiveNonInitial<number> | ReactiveInitial<number>) {
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
    value: events.value,
    set
  }
}
