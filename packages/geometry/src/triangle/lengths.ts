import { guard } from "./guard.js";
import type { Triangle } from "./triangle-type.js";
import { distance } from "../point/distance.js";
/**
 * Returns the lengths of the triangle sides
 * @param t
 * @returns Array of length three
 */
export const lengths = (t: Triangle): ReadonlyArray<number> => {
  guard(t);
  return [
    distance(t.a, t.b),
    distance(t.b, t.c),
    distance(t.c, t.a),
  ];
};