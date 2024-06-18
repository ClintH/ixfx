
import type { Triangle } from "../Types.js";
import type { PolyLine } from "../line/LineType.js";
import { joinPointsToLines } from "../line/JoinPointsToLines.js";
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