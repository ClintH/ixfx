import { guard } from "./Guard.js";
import type { Triangle } from "./TriangleType.js";
import { length as LinesLength } from '../line/Length.js';
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