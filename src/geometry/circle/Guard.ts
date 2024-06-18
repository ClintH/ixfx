import { guard as guardPoint } from '../point/Guard.js';
import type { Point } from '../point/PointType.js';
import type { Circle, CirclePositioned } from './CircleType.js';

/**
 * Throws if radius is out of range. If x,y is present, these will be validated too.
 * @param circle 
 * @param paramName 
 */
export const guard = (circle: CirclePositioned | Circle, parameterName = `circle`) => {
  if (isCirclePositioned(circle)) {
    guardPoint(circle, `circle`);
  }

  if (Number.isNaN(circle.radius)) throw new Error(`${ parameterName }.radius is NaN`);
  if (circle.radius <= 0) throw new Error(`${ parameterName }.radius must be greater than zero`);
};

/**
 * Throws if `circle` is not positioned or has dodgy fields
 * @param circle 
 * @param paramName 
 * @returns 
 */
export const guardPositioned = (circle: CirclePositioned, parameterName = `circle`) => {
  if (!isCirclePositioned(circle)) throw new Error(`Expected a positioned circle with x,y`);
  guard(circle, parameterName);
};

/***
 * Returns true if radius, x or y are NaN
 */
export const isNaN = (a: Circle | CirclePositioned): boolean => {
  if (Number.isNaN(a.radius)) return true;
  if (isCirclePositioned(a)) {
    if (Number.isNaN(a.x)) return true;
    if (Number.isNaN(a.y)) return true;
  }
  return false;
};


/**
 * Returns true if parameter has x,y. Does not verify if parameter is a circle or not
 * 
 * ```js
 * import { Circles } from "https://unpkg.com/ixfx/dist/geometry.js" 
 * 
 * const circleA = { radius: 5 };
 * Circles.isPositioned(circle); // false
 * 
 * const circleB = { radius: 5, x: 10, y: 10 }
 * Circles.isPositioned(circle); // true
 * ```
 * @param p Circle
 * @returns 
 */
export const isPositioned = (p: Circle | Point): p is Point => (p as Point).x !== undefined && (p as Point).y !== undefined;
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isCircle = (p: any): p is Circle => (p as Circle).radius !== undefined;
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isCirclePositioned = (p: any): p is CirclePositioned => isCircle(p) && isPositioned(p);