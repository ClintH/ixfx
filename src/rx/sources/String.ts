/* eslint-disable @typescript-eslint/unbound-method */
import { initStream } from "../InitStream.js";
import type { ReactiveWritable, ReactiveInitial, ReactiveNonInitial } from "../Types.js";

export function string(initialValue: string): ReactiveWritable<string> & ReactiveInitial<string>;
export function string(): ReactiveWritable<string> & ReactiveNonInitial<string>;
export function string(initialValue?: string): ReactiveWritable<string> & (ReactiveNonInitial<string> | ReactiveInitial<string>) {
  let value = initialValue;
  const events = initStream<string>();

  const set = (v: string) => {
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