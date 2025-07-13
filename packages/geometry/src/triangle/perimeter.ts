import { guard } from "./guard.js";
import type { Triangle } from "./triangle-type.js";
import { length as LinesLength } from '../line/length.js';
import { edges } from "./edges.js";

/**
 * Calculates perimeter of a triangle
 * @param t
 * @returns
 */
export const perimeter = (t: Triangle): number => {
  guard(t);
  return edges(t).reduce((accumulator, v) => accumulator + LinesLength(v), 0);
};