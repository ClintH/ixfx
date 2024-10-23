import { piPi } from '../data/index.js';
import type { Point } from './point/PointType.js';
/**
 * Convert angle in degrees to angle in radians.
 * @param angleInDegrees 
 * @returns 
 */
export function degreeToRadian(angleInDegrees: number): number;

/**
 * Convert angles in degrees to angles in radians
 * @param angleInDegrees 
 */
export function degreeToRadian(angleInDegrees: ReadonlyArray<number>): ReadonlyArray<number>;

 
export function degreeToRadian(angleInDegrees: number | ReadonlyArray<number>): number | ReadonlyArray<number> {
  return Array.isArray(angleInDegrees) ? angleInDegrees.map(v => v * (Math.PI / 180)) : (angleInDegrees as number) * (Math.PI / 180);
}

/**
 * Inverts the angle so it points in the opposite direction of a unit circle
 * @param angleInRadians 
 * @returns 
 */
export function radianInvert(angleInRadians: number) {
  return (angleInRadians + Math.PI) % (2 * Math.PI);
}

/**
 * Convert angle in radians to angle in degrees
 * @param angleInRadians
 * @returns 
 */
export function radianToDegree(angleInRadians: number): number;

/**
 * Convert angles in radians to angles in degrees
 * @param angleInRadians 
 */
export function radianToDegree(angleInRadians: ReadonlyArray<number>): ReadonlyArray<number>;

 
export function radianToDegree(angleInRadians: number | ReadonlyArray<number>): number | ReadonlyArray<number> {
  return Array.isArray(angleInRadians) ? angleInRadians.map(v => v * 180 / Math.PI) : (angleInRadians as number) * 180 / Math.PI;
}


/**
 * Angle from x-axis to point (ie. `Math.atan2`)
 * @param point 
 * @returns 
 */
export const radiansFromAxisX = (point: Point): number => Math.atan2(point.x, point.y);

/**
 * Sum angles together, accounting for the 'wrap around'.
 * 
 * `clockwise` of _true_ (default) means angles are added in clockwise direction
 * 
 * ```js
 * // From 180deg, add 90deg in the clockwise direction
 * radiansSum(Math.PI, Math.PI/2, true);
 * ```
 * 
 * Orientation of angles is as follows:
 * ```
 *       90deg
 *       Pi/2
 *        |
 * Pi  ---+--- 0
 * 180    |
 *       3PI/2
 *       270deg
 * ```
 * {@link degreesSum} is the same, but uses degrees (0..360)
 * @param start Starting angle, in radian
 * @param amount Angle to add, in radian
 * @param clockwise Add in clockwise direction (default: _true_)
 * @returns Sum result, in radians
 */
export const radiansSum = (start: number, amount: number, clockwise = true) => {
  if (clockwise) {
    let x = start + amount;
    if (x >= piPi) x = x % piPi;
    return x;
  } else {
    const x = start - amount;
    if (x < 0) {
      return piPi + x;
    }
    return x;
  }
}

/**
 * Sum angles together, accounting for the 'wrap around'.
 * 
 * `clockwise` of _true_ (default) means angles are added in clockwise direction
 * 
 * ```js
 * // From 180deg, add 90deg in the clockwise direction
 * radiansSum(180, 90, true);
 * ```
 * 
 * {@link radiansSum} is the same, but uses radians (0..2 Pi)
 * 
 * Orientation of angles is as follows:
 * ```
 *       90
 *        |
 * 180 ---+--- 0
 *        |
 *       270
 * ```
 * @param start Starting angle, in degrees
 * @param amount Angle to add, in degrees
 * @param clockwise Add in clockwise direction (default: _true_)
 * @returns Sum result, in degrees
 */
export const degreesSum = (start: number, amount: number, clockwise = true) => radianToDegree(radiansSum(degreeToRadian(start), degreeToRadian(amount), clockwise));

/**
 * Computes the angle arc between a start and end angle,
 * given in radians. It properly accounts for the wrap-around
 * values.
 * 
 * ```js
 * // Between 0-90deg in clockwise direction
 * radianArc(0, Math.PI/2, true); // Yields: 3Pi/2 (270 deg)
 * 
 * // In counter-clockwise direction
 * radianArc(0, Math.PI/2, false); // Yields: Math.PI/2 (90deg)
 * ```
 * 
 * See {@link degreeArc} to operate in degrees.
 * 
 * Orientation of angles is as follows:
 * ```
 *       90deg
 *       Pi/2
 *        |
 * Pi  ---+--- 0
 * 180    |
 *       3PI/2
 *       270deg
 * ```
 * @param start Start angle, in radians
 * @param end End angle, in radians
 * @param clockwise Calculate in clockwise direction (default: _true_)
 * @returns Angle of arc, in radians.
 */
export const radianArc = (start: number, end: number, clockwise = true) => {
  let s = start;
  if (end < s) {
    s = 0;
    end = piPi - start + end;
  }
  let d = end - s;
  if (clockwise) d = piPi - d;
  if (d >= piPi) return d % piPi;
  return d;
}

/**
 * Computes the angle arc between a start and end angle,
 * given in degrees. It properly accounts for the wrap-around
 * values.
 * 
 * ```js
 * // Between 0-90 in clockwise direction
 * degreeArc(0, 90, true); // Yields: 270
 * 
 * // In counter-clockwise direction
 * degreeArc(0, 90, false); // Yields: 90
 * ```
 * 
 * See {@link radianArc} to operate in radians.
 * 
 * Orientation of angles is as follows:
 * ```
 *       90
 *        |
 * 180 ---+--- 0
 *        |
 *       270
 * ```
 * @param start Start angle, in degrees
 * @param end End angle, in degrees
 * @param clockwise Calculate in clockwise direction (default: _true_)
 * @returns Angle of arc, in degrees.
 */
export const degreeArc = (start: number, end: number, clockwise = true) => radianToDegree(radianArc(degreeToRadian(start), degreeToRadian(end), clockwise));