import { dotProduct as ArraysDotProduct } from '@ixfxfun/numbers';
import type { Point } from './point-type.js';
import { toArray } from './to-array.js';

export const dotProduct = (...pts: ReadonlyArray<Point>): number => {
  const a = pts.map(p => toArray(p));
  return ArraysDotProduct(a);
};