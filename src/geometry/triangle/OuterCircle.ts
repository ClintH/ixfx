import { length as LinesLength } from '../line/Length.js';
import { edges } from "./Edges.js";
import { centroid } from './Centroid.js';
import type { Triangle } from "./TriangleType.js";
import type { CirclePositioned } from '../circle/CircleType.js';

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