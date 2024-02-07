import { length as LinesLength } from '../line/index.js';
import type { Triangle, CirclePositioned } from "../Types.js";

import { edges } from "./Edges.js";
import { centroid } from './index.js';

/**
 * Returns the largest circle touching the corners of triangle `t`.
 * @param t
 * @returns
 */
export const outerCircle = (t: Triangle): CirclePositioned => {
  const [ a, b, c ] = edges(t).map((l) => LinesLength(l));
  const cent = centroid(t);
  const radius =
    (a * b * c) /
    Math.sqrt((a + b + c) * (-a + b + c) * (a - b + c) * (a + b - c));
  return {
    radius,
    ...cent,
  };
};