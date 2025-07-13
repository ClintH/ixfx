import { angles } from "./angles.js";
import { guard } from "./guard.js";
import { lengths } from "./lengths.js";
import type { Triangle } from "./triangle-type.js";

/**
 * Returns true if it is an equilateral triangle
 * @param t
 * @returns
 */
export const isEquilateral = (t: Triangle): boolean => {
  guard(t);
  const [ a, b, c ] = lengths(t);
  return a === b && b === c;
};

/**
 * Returns true if it is an isosceles triangle
 * @param t
 * @returns
 */
export const isIsosceles = (t: Triangle): boolean => {
  const [ a, b, c ] = lengths(t);
  if (a === b) return true;
  if (b === c) return true;
  if (c === a) return true;
  return false;
};

/**
 * Returns true if at least one interior angle is 90 degrees
 * @param t
 * @returns
 */
export const isRightAngle = (t: Triangle): boolean =>
  angles(t).includes(Math.PI / 2);

/**
 * Returns true if triangle is oblique: No interior angle is 90 degrees
 * @param t
 * @returns
 */
export const isOblique = (t: Triangle): boolean => !isRightAngle(t);

/**
 * Returns true if triangle is actue: all interior angles less than 90 degrees
 * @param t
 * @returns
 */
export const isAcute = (t: Triangle): boolean =>
  !angles(t).some((v) => v >= Math.PI / 2);

/**
 * Returns true if triangle is obtuse: at least one interior angle is greater than 90 degrees
 * @param t
 * @returns
 */
export const isObtuse = (t: Triangle): boolean =>
  angles(t).some((v) => v > Math.PI / 2);
