import { quantiseEvery as quantiseEveryNumber } from '../../numbers/Quantise.js';
import { guard, isPoint3d } from './Guard.js';
import type { Point, Point3d } from './PointType.js';

export function quantiseEvery(pt: Point3d, snap: Point3d, middleRoundsUp?: boolean): Point3d;
export function quantiseEvery(pt: Point, snap: Point, middleRoundsUp?: boolean): Point;

/**
 * Quantises a point.
 * @param pt 
 * @param snap 
 * @param middleRoundsUp 
 * @returns 
 */
export function quantiseEvery(pt: Point, snap: Point, middleRoundsUp = true): Point {
  guard(pt, `pt`);
  guard(snap, `snap`);
  if (isPoint3d(pt)) {
    if (!isPoint3d(snap)) throw new TypeError(`Param 'snap' is missing 'z' field`);
    return Object.freeze({
      x: quantiseEveryNumber(pt.x, snap.x, middleRoundsUp),
      y: quantiseEveryNumber(pt.y, snap.y, middleRoundsUp),
      z: quantiseEveryNumber(pt.z, snap.z, middleRoundsUp)
    });
  }

  return Object.freeze({
    x: quantiseEveryNumber(pt.x, snap.x, middleRoundsUp),
    y: quantiseEveryNumber(pt.y, snap.y, middleRoundsUp),
  });
}