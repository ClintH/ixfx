import { distance } from "./Distance.js";
import { multiply } from "./Multiply.js";
import type { Point } from "./PointType.js";

/**
 * Clamps the magnitude of a point.
 * This is useful when using a Point as a vector, to limit forces.
 * @param pt
 * @param max Maximum magnitude (1 by default)
 * @param min Minimum magnitude (0 by default)
 * @returns
 */
export const clampMagnitude = (pt: Point, max = 1, min = 0): Point => {
  const length = distance(pt);
  let ratio = 1;
  if (length > max) {
    ratio = max / length;
  } else if (length < min) {
    ratio = min / length;
  }
  return ratio === 1 ? pt : multiply(pt, ratio, ratio);
};