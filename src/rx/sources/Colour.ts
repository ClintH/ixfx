//import * as ColorJs from "colorjs.io";

import * as Colour from '../../visual/colour/index.js';
import { initStream } from "../InitStream.js";
import type { ReactiveWritable, ReactiveInitial, ReactiveNonInitial } from "../Types.js";

export type ReactiveColour = ReactiveWritable<Colour.Colourish> & {
  setHsl: (hsl: Colour.Hsl) => void;
}

export function colour(initialValue: Colour.Colourish): ReactiveColour & ReactiveInitial<Colour.Colourish>;
export function colour(): ReactiveColour & ReactiveNonInitial<Colour.Colourish>;
export function colour(initialValue?: Colour.Colourish): ReactiveColour & (ReactiveNonInitial<Colour.Colourish> | ReactiveInitial<Colour.Colourish>) {
  let value = initialValue;
  const events = initStream<Colour.Colourish>();

  const set = (v: Colour.Colourish) => {
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
    setHsl: (hsl: Colour.Hsl) => {
      set(hsl);
    }
  }
}
