import { quantiseEvery as quantiseEveryNumber } from '../../numbers/Quantise.js';
import { guard } from './Guard.js';
import type { Point } from './PointType.js';

/**
 * Quantises a point
 * @param pt 
 * @param snap 
 * @param middleRoundsUp 
 * @returns 
 */
export const quantiseEvery = (pt: Point, snap: Point, middleRoundsUp = true) => {
  guard(pt, `pt`);
  guard(snap, `snap`);
  return Object.freeze({
    x: quantiseEveryNumber(pt.x, snap.x, middleRoundsUp),
    y: quantiseEveryNumber(pt.y, snap.y, middleRoundsUp),
  });
}