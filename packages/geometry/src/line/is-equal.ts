import type { Line } from "./line-type.js";
import { isEqual as PointsIsEqual } from '../point/is-equal.js';
/**
 * Returns true if the lines have the same value. Note that only
 * the line start and end points are compared. So the lines might
 * be different in other properties, and `isEqual` will still return
 * true.
 * 
 * ```js
 * const a = { a: {x:0,  y: 10 }, b: { x: 20, y: 20 }};
 * const b = { a: {x:0,  y: 10 }, b: { x: 20, y: 20 }};
 * a === b; // false, because they are different objects
 * Lines.isEqual(a, b); // true, because they have the same value
 * ```
 * @param {Line} a
 * @param {Line} b
 * @returns {boolean}
 */
export const isEqual = (a: Line, b: Line): boolean => PointsIsEqual(a.a, b.a) && PointsIsEqual(a.b, b.b);