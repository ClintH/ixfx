import { dotProduct as ArraysDotProduct } from '@ixfx/numbers';
import type { Point } from './point-type.js';
import { toArray } from './to-array.js';

export const dotProduct = (...pts: readonly Point[]): number => {
  const a = pts.map(p => toArray(p));
  return ArraysDotProduct(a);
};