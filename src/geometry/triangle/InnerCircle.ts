import type { CirclePositioned } from "../circle/CircleType.js";
import { area } from "./Area.js";
import { centroid } from "./Centroid.js";
import { perimeter } from "./Perimeter.js";
import type { Triangle } from "./TriangleType.js";

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