import type { Triangle } from "../Types.js";

import { guard as PointsGuard } from '../point/Guard.js'

/**
 * Throws an exception if the triangle is invalid
 * @param t
 * @param name
 */
export const guard = (t: Triangle, name = `t`) => {
  if (t === undefined) throw new Error(`{$name} undefined`);
  PointsGuard(t.a, name + `.a`);
  PointsGuard(t.b, name + `.b`);
  PointsGuard(t.c, name + `.c`);
};