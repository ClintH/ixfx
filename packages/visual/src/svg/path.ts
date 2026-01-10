import type { DrawingOpts } from "../drawing.js";
import { markerPrebuilt } from "./markers.js";
import type { PathDrawingOpts } from "./types.js";

/**
 * Applies path drawing options to given element
 * Applies: markerEnd, markerStart, markerMid
 * @param elem Element (presumed path)
 * @param opts Options
 */
export const applyPathOpts = (elem: SVGElement, opts: PathDrawingOpts): void => {
  if (opts.markerEnd) {
    elem.setAttribute(
      `marker-end`,
      markerPrebuilt(elem, opts.markerEnd, opts as DrawingOpts)
    );
  }
  if (opts.markerStart) {
    elem.setAttribute(
      `marker-start`,
      markerPrebuilt(elem, opts.markerStart, opts as DrawingOpts)
    );
  }
  if (opts.markerMid) {
    elem.setAttribute(
      `marker-mid`,
      markerPrebuilt(elem, opts.markerMid, opts as DrawingOpts)
    );
  }
};