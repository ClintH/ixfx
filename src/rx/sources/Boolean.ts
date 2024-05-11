/* eslint-disable @typescript-eslint/unbound-method */
import { initStream } from "../InitStream.js";
import type { ReactiveDisposable, ReactiveWritable, ReactiveInitial, ReactiveNonInitial } from "../Types.js";

export function boolean(initialValue: boolean): ReactiveDisposable<boolean> & ReactiveWritable<boolean> & ReactiveInitial<boolean>;
export function boolean(): ReactiveDisposable<boolean> & ReactiveWritable<boolean> & ReactiveNonInitial<boolean>;
export function boolean(initialValue?: boolean): ReactiveDisposable<boolean> & ReactiveWritable<boolean> & (ReactiveNonInitial<boolean> | ReactiveInitial<boolean>) {
  let value = initialValue;
  const events = initStream<boolean>();

  const set = (v: boolean) => {
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