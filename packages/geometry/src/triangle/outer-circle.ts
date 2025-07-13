import { length as LinesLength } from '../line/length.js';
import { edges } from "./edges.js";
import { centroid } from './centroid.js';
import type { Triangle } from "./triangle-type.js";
import type { CirclePositioned } from '../circle/circle-type.js';

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