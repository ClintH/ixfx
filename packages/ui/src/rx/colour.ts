
import { initStream, type ReactiveInitial, type ReactiveNonInitial, type ReactiveWritable } from "@ixfx/rx";
import type { HslScalar } from "@ixfx/visual/colour";

export type ReactiveColour = ReactiveWritable<HslScalar> & {
  setHsl: (hsl: HslScalar) => void;
}

export function colour(initialValue: HslScalar): ReactiveColour & ReactiveInitial<HslScalar>;
export function colour(): ReactiveColour & ReactiveNonInitial<HslScalar>;
export function colour(initialValue?: HslScalar): ReactiveColour & (ReactiveNonInitial<HslScalar> | ReactiveInitial<HslScalar>) {
  let value = initialValue;
  const events = initStream<HslScalar>();

  const set = (v: HslScalar) => {
    value = v;
    events.set(v);
  }

  return {
    dispose: events.dispose,
    isDisposed: events.isDisposed,
    last: () => value,
    on: events.on,
    onValue: events.onValue,
    set,
    setHsl: (hsl: HslScalar) => {
      set(hsl);
    }
  }
}
