import { initStream } from "../../../rx/src/init-stream.js";
import type { ReactiveWritable, ReactiveInitial, ReactiveNonInitial } from "../../../rx/src/types.js";
import type { HslRelative } from "@ixfxfun/visual/colour";

export type ReactiveColour = ReactiveWritable<HslRelative> & {
  setHsl: (hsl: HslRelative) => void;
}

export function colour(initialValue: HslRelative): ReactiveColour & ReactiveInitial<HslRelative>;
export function colour(): ReactiveColour & ReactiveNonInitial<HslRelative>;
export function colour(initialValue?: HslRelative): ReactiveColour & (ReactiveNonInitial<HslRelative> | ReactiveInitial<HslRelative>) {
  let value = initialValue;
  const events = initStream<HslRelative>();

  const set = (v: HslRelative) => {
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
    setHsl: (hsl: HslRelative) => {
      set(hsl);
    }
  }
}
