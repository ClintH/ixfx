import { guard } from "./Guard.js";
import { length as LinesLength } from '../line/index.js';
import { edges } from "./Edges.js";
import type { Triangle } from "../Types.js";

/**
 * Calculates the area of a triangle
 * @param t
 * @returns
 */
export const area = (t: Triangle): number => {
  guard(t, `t`);

  // Get length of edges
  const lengths = edges(t).map((l) => LinesLength(l));

  // Add up length of edges, halve
  const p = (lengths[ 0 ] + lengths[ 1 ] + lengths[ 2 ]) / 2;
  return Math.sqrt(p * (p - lengths[ 0 ]) * (p - lengths[ 1 ]) * (p - lengths[ 2 ]));
};