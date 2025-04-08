import type { CirclePositioned } from "../circle/circle-type.js";
import { area } from "./area.js";
import { centroid } from "./centroid.js";
import { perimeter } from "./perimeter.js";
import type { Triangle } from "./triangle-type.js";

/**
 * Returns the largest circle enclosed by triangle `t`.
 * @param t
 */
export const innerCircle = (t: Triangle): CirclePositioned => {
  const c = centroid(t);
  const p = perimeter(t) / 2;
  const a = area(t);
  const radius = a / p;
  return { radius, ...c };
};