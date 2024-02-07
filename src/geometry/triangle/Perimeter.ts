import { guard } from "./Guard.js";
import type { Triangle } from "../Types.js";
import { length as LinesLength } from '../line/index.js';
import { edges } from "./Edges.js";

/**
 * Calculates perimeter of a triangle
 * @param t
 * @returns
 */
export const perimeter = (t: Triangle): number => {
  guard(t);
  return edges(t).reduce((accumulator, v) => accumulator + LinesLength(v), 0);
};