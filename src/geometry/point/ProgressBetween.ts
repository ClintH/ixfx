
import { isPoint3d } from "./Guard.js";
import type { Point3d, Point } from "./PointType.js";
import { subtract } from "./Subtract.js";

export const progressBetween = (
  currentPos: Point | Point3d,
  from: Point | Point3d,
  to: Point | Point3d
) => {
  // Via: https://www.habrador.com/tutorials/math/2-passed-waypoint/?s=09
  // from -> current
  const a = subtract(currentPos, from);

  // from -> to
  const b = subtract(to, from);

  return isPoint3d(a) && isPoint3d(b) ? (
    (a.x * b.x + a.y * b.y + a.z * b.z) / (b.x * b.x + b.y * b.y + b.z * b.z)
  ) : (a.x * b.x + a.y * b.y) / (b.x * b.x + b.y * b.y);
};