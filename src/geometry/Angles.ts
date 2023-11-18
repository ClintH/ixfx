import type { Point } from './Types.js';
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

//eslint-disable-next-line func-style
export function degreeToRadian(angleInDegrees: number | ReadonlyArray<number>): number | ReadonlyArray<number> {
  return Array.isArray(angleInDegrees) ? angleInDegrees.map(v => v * (Math.PI / 180)) : (angleInDegrees as number) * (Math.PI / 180);
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

//eslint-disable-next-line func-style
export function radianToDegree(angleInRadians: number | ReadonlyArray<number>): number | ReadonlyArray<number> {
  return Array.isArray(angleInRadians) ? angleInRadians.map(v => v * 180 / Math.PI) : (angleInRadians as number) * 180 / Math.PI;
}


/**
 * Angle from x-axis to point (ie. `Math.atan2`)
 * @param point 
 * @returns 
 */
export const radiansFromAxisX = (point: Point): number => Math.atan2(point.x, point.y);
