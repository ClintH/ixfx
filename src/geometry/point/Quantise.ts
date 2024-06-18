import { quantiseEvery as quantiseEveryNumber } from '../../numbers/Quantise.js';
import type { Point } from './PointType.js';

export const quantiseEvery = (pt: Point, snap: Point, middleRoundsUp = true) =>
  Object.freeze({
    x: quantiseEveryNumber(pt.x, snap.x, middleRoundsUp),
    y: quantiseEveryNumber(pt.y, snap.y, middleRoundsUp),
  });