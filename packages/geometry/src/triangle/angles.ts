import type { Triangle } from "./triangle-type.js";
import { angleRadian as PointsAngleRadian } from '../point/angle.js';
import { guard } from "./guard.js";
import { radianToDegree } from "../angles.js";

/**
 * Return the three interior angles of the triangle, in radians.
 * @param t
 * @returns
 */
export const angles = (t: Triangle): ReadonlyArray<number> => {
  guard(t);
  return [
    PointsAngleRadian(t.a, t.b),
    PointsAngleRadian(t.b, t.c),
    PointsAngleRadian(t.c, t.a),
  ];
};

/**
 * Returns the three interior angles of the triangle, in degrees
 * @param t
 * @returns
 */
export const anglesDegrees = (t: Triangle): ReadonlyArray<number> => {
  guard(t);
  return radianToDegree(angles(t));
};