import { resolveEl } from "./ResolveEl.js";
import { Scaler } from '../geometry/index.js';
import { type Rect } from '../geometry/rect/index.js';
import { multiply as RectsMultiply } from "../geometry/rect/index.js";
import { windowResize } from "./DomRx.js";

export type CanvasOpts = {
  readonly skipCss?: boolean;
  readonly fullSize?: boolean;
  readonly scaleBy?: `both` | `width` | `height` | `min` | `max`;
};
export const canvasHelper = (
  domQueryOrEl: Readonly<string | HTMLCanvasElement | undefined | null>,
  opts: CanvasOpts
) => {
  if (!domQueryOrEl) throw new Error(`domQueryOrEl is null or undefined`);
  const el = resolveEl<HTMLCanvasElement>(domQueryOrEl);
  if (el.nodeName !== `CANVAS`) {
    throw new Error(`Expected CANVAS HTML element. Got: ${ el.nodeName }`);
  }
  const fullSize = opts.fullSize ?? true;
  const ratio = Math.round(window.devicePixelRatio) || 1;
  const scaleBy = opts.scaleBy ?? `both`;

  let scaler: Scaler.ScalerCombined = Scaler.scaler(`both`);

  const updateDimensions = (rect: Rect) => {
    // Create a new scaler
    scaler = Scaler.scaler(scaleBy, rect);

    const pixelScaled = RectsMultiply(rect, ratio, ratio);

    el.width = pixelScaled.width;
    el.height = pixelScaled.height;
    el.style.width = rect.width + `px`;
    el.style.height = rect.height + `px`;
  };

  // Window has resized
  const onWindowResize = () => {
    const innerWindow = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    updateDimensions(innerWindow);
  };

  const getContext = () => {
    const ctx = el.getContext(`2d`);
    if (ctx === null) throw new Error(`Could not create drawing context`);

    ctx.scale(ratio, ratio);
  };

  if (fullSize) {
    const r = windowResize();
    r.value(onWindowResize);
  }

  return {
    abs: scaler.abs,
    rel: scaler.rel,
    getContext,
  };
};