import type { Triangle } from "./triangle-type.js";
import { isPoint, guard as PointsGuard, isPlaceholder as PointsIsPlaceholder, isEmpty as PointsIsEmpty } from '../point/guard.js'
import { isEqual as PointsIsEqual } from "../point/is-equal.js";

/**
 * Throws an exception if the triangle is invalid
 * @param t
 * @param name
 */
export const guard = (t: Triangle, name = `t`): void => {
  if (t === undefined) throw new Error(`{$name} undefined`);
  PointsGuard(t.a, name + `.a`);
  PointsGuard(t.b, name + `.b`);
  PointsGuard(t.c, name + `.c`);
};

/**
 * Returns true if the parameter appears to be a valid triangle
 * @param p
 * @returns
 */
export const isTriangle = (p: unknown): p is Triangle => {
  if (p === undefined) return false;
  const tri = p as Triangle;
  if (!isPoint(tri.a)) return false;
  if (!isPoint(tri.b)) return false;
  if (!isPoint(tri.c)) return false;
  return true;
};


/**
 * Returns true if triangle is empty
 * @param t
 * @returns
 */
export const isEmpty = (t: Triangle): boolean =>
  PointsIsEmpty(t.a) && PointsIsEmpty(t.b) && PointsIsEmpty(t.c);

/**
 * Returns true if triangle is a placeholder
 * @param t
 * @returns
 */
export const isPlaceholder = (t: Triangle): boolean =>
  PointsIsPlaceholder(t.a) &&
  PointsIsPlaceholder(t.b) &&
  PointsIsPlaceholder(t.c);

/**
 * Returns true if the two parameters have equal values
 * @param a
 * @param b
 * @returns
 */
export const isEqual = (a: Triangle, b: Triangle): boolean =>
  PointsIsEqual(a.a, b.a) &&
  PointsIsEqual(a.b, b.b) &&
  PointsIsEqual(a.c, b.c);