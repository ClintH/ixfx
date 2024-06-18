import { round as roundNumber } from '../../numbers/Round.js';
import { getPointParameter } from './GetPointParameter.js';
import type { Point } from './PointType.js';

/**
 * Round the point's _x_ and _y_ to given number of digits
 * @param ptOrX 
 * @param yOrDigits 
 * @param digits 
 * @returns 
 */
export const round = (ptOrX: Point | number, yOrDigits?: number, digits?: number): Point => {
  const pt = getPointParameter(ptOrX, yOrDigits);
  digits = digits ?? yOrDigits;
  digits = digits ?? 2;
  return Object.freeze({
    ...pt,
    x: roundNumber(digits, pt.x),
    y: roundNumber(digits, pt.y)
  })
}