import type { PolarRay } from "src/geometry/polar/Types.js";
import type { Line } from "../../geometry/line/LineType.js";
import type { Point } from "../../geometry/point/PointType.js";
import { fromLine as polarRayFromLine } from "../../geometry/polar/Ray.js";

/**
 * Returns a Line type from an SVGLineElement
 * @param el SVG Line Element
 * @returns 
 */
export const lineFromSvgLine = (el: SVGLineElement): Line => {
  if (!el) throw new Error(`Param 'el' is undefined`);
  const a = { x: el.x1.baseVal.value, y: el.y1.baseVal.value };
  const b = { x: el.x2.baseVal.value, y: el.y2.baseVal.value };
  return { a, b }
}

export const polarRayFromSvgLine = (el: SVGLineElement, origin: Point): PolarRay => {
  const l = lineFromSvgLine(el);
  return polarRayFromLine(l, origin);
}