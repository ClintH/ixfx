
import { isPoint3d } from "./Guard.js";
import type { Point3d, Point } from "./PointType.js";
import { subtract } from "./Subtract.js";

/**
 * Computes the progress between two waypoints, given `position`.
 * 
 * [Source](https://www.habrador.com/tutorials/math/2-passed-waypoint/?s=09)
 * @param position Current position
 * @param waypointA Start
 * @param waypointB End
 * @returns 
 */
export const progressBetween = (
  position: Point | Point3d,
  waypointA: Point | Point3d,
  waypointB: Point | Point3d
) => {
  // Via: https://www.habrador.com/tutorials/math/2-passed-waypoint/?s=09
  // from -> current
  const a = subtract(position, waypointA);

  // from -> to
  const b = subtract(waypointB, waypointA);

  return isPoint3d(a) && isPoint3d(b) ? (
    (a.x * b.x + a.y * b.y + a.z * b.z) / (b.x * b.x + b.y * b.y + b.z * b.z)
  ) : (a.x * b.x + a.y * b.y) / (b.x * b.x + b.y * b.y);
};