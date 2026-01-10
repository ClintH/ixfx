import type { DrawingOpts } from "./types.js";

/**
 * Applies drawing options to given SVG element.
 * Applies: fillStyle
 * @param elem Element
 * @param opts Drawing options
 */
export const applyOpts = (elem: SVGElement, opts: DrawingOpts): void => {
  if (opts.fillStyle) elem.setAttributeNS(null, `fill`, opts.fillStyle);
  if (opts.opacity) {
    elem.setAttributeNS(null, `opacity`, opts.opacity.toString());
  }

};