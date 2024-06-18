import { dotProduct as ArraysDotProduct } from '../../collections/arrays/index.js';
import type { Point } from './PointType.js';
import { toArray } from './ToArray.js';

export const dotProduct = (...pts: ReadonlyArray<Point>): number => {
  const a = pts.map(p => toArray(p));
  return ArraysDotProduct(a);
};