/* eslint-disable @typescript-eslint/unbound-method */
import type Color from "colorjs.io";
import * as Colour from '../../visual/Colour.js';
import { initStream } from "../InitStream.js";
import type { ReactiveWritable, ReactiveInitial, ReactiveNonInitial } from "../Types.js";

export type ReactiveColour = ReactiveWritable<Color> & {
  setHsl: (hsl: Colour.Hsl) => void;
}

export function colour(initialValue: Color): ReactiveColour & ReactiveInitial<Color>;
export function colour(): ReactiveColour & ReactiveNonInitial<Color>;
export function colour(initialValue?: Color): ReactiveColour & (ReactiveNonInitial<Color> | ReactiveInitial<Color>) {
  let value = initialValue;
  const events = initStream<Color>();

  const set = (v: Color) => {
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
      set(Colour.resolve(hsl))
    }
  }
}
