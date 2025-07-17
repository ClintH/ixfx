import { guard } from "./guard.js";
import type { Triangle } from "./triangle-type.js";

/**
 * Returns the coordinates of triangle in a flat array form:
 * [xA, yA, xB, yB, xC, yC]
 * @param t
 * @returns
 */
export const toFlatArray = (t: Triangle): readonly number[] => {
  guard(t);
  return [ t.a.x, t.a.y, t.b.x, t.b.y, t.c.x, t.c.y ];
};