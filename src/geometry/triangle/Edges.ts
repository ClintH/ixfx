
import type { Triangle, PolyLine } from "../Types.js";
import { joinPointsToLines } from "../line/index.js";
import { guard } from "./Guard.js";
/**
 * Returns the edges (ie sides) of the triangle as an array of lines
 * @param t
 * @returns Array of length three
 */
export const edges = (t: Triangle): PolyLine => {
  guard(t);
  return joinPointsToLines(t.a, t.b, t.c, t.a);
};