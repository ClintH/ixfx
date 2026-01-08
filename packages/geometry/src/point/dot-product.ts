import { dotProduct as ArraysDotProduct } from '@ixfx/numbers';
import type { Point } from './point-type.js';
import { toArray } from './to-array.js';

export const dotProduct = (...pts: readonly Point[]): number => {
  const a = pts.map(p => toArray(p));
  return ArraysDotProduct(a);
};

/**
 * Returns the cross-product:
 * ```
 * ax * by - ay * bx
 * ```
 * @param a 
 * @param b
 * @returns 
 */
export function cross(a: Point, b: Point): number {
  return a.x * b.y - a.y * b.x;
}

/**
 * Returns the cross-product:
 * ```
 * ax * by - ay * bx
 * ```
 * @param ax 
 * @param ay 
 * @param bx 
 * @param by 
 * @returns 
 */
export function crossProductRaw(ax: number, ay: number, bx: number, by: number): number {
  return ax * by - ay * bx;
}