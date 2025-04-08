import type { StrokeOpts } from "./types.js";

/**
 * Applies drawing options to given SVG element.
 * Applies: strokeStyle, strokeWidth, strokeDash, strokeLineCap
 * @param elem Element
 * @param opts
 */
export const applyStrokeOpts = (elem: SVGElement, opts: StrokeOpts) => {
  if (opts.strokeStyle) elem.setAttributeNS(null, `stroke`, opts.strokeStyle);
  if (opts.strokeWidth) {
    elem.setAttributeNS(null, `stroke-width`, opts.strokeWidth.toString());
  }
  if (opts.strokeDash) elem.setAttribute(`stroke-dasharray`, opts.strokeDash);
  if (opts.strokeLineCap) {
    elem.setAttribute(`stroke-linecap`, opts.strokeLineCap);
  }
};