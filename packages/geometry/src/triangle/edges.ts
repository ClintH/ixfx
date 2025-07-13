
import type { Triangle } from "./triangle-type.js";
import type { PolyLine } from "../line/line-type.js";
import { joinPointsToLines } from "../line/join-points-to-lines.js";
import { guard } from "./guard.js";
/**
 * Returns the edges (ie sides) of the triangle as an array of lines
 * @param t
 * @returns Array of length three
 */
export const edges = (t: Triangle): PolyLine => {
  guard(t);
  return joinPointsToLines(t.a, t.b, t.c, t.a);
};