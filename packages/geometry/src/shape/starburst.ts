import { throwIntegerTest } from "@ixfxfun/guards";
import { toCartesian } from "../polar/conversions.js";
import { Empty as PointEmpty } from "../point/empty.js";
import type { Point } from "../point/point-type.js";
/**
 * Generates a starburst shape, returning an array of points. By default, initial point is top and horizontally-centred.
 *
 * ```
 * // Generate a starburst with four spikes
 * const pts = starburst(4, 100, 200);
 * ```
 *
 * `points` of two produces a lozenge shape.
 * `points` of three produces a triangle shape.
 * `points` of five is the familiar 'star' shape.
 *
 * Note that the path will need to be closed back to the first point to enclose the shape.
 *
 * @example Create starburst and draw it. Note use of 'loop' flag to close the path
 * ```
 * const points = starburst(4, 100, 200);
 * Drawing.connectedPoints(ctx, pts, {loop: true, fillStyle: `orange`, strokeStyle: `red`});
 * ```
 *
 * Options:
 * * initialAngleRadian: angle offset to begin from. This overrides the `-Math.PI/2` default.
 *
 * @param points Number of points in the starburst. Defaults to five, which produces a typical star
 * @param innerRadius Inner radius. A proportionally smaller inner radius makes for sharper spikes. If unspecified, 50% of the outer radius is used.
 * @param outerRadius Outer radius. Maximum radius of a spike to origin
 * @param opts Options
 * @param origin Origin, or `{ x:0, y:0 }` by default.
 */
export const starburst = (
  outerRadius: number,
  points = 5,
  innerRadius?: number,
  origin: Point = PointEmpty,
  opts?: { readonly initialAngleRadian?: number }
): ReadonlyArray<Point> => {
  throwIntegerTest(points, `positive`, `points`);
  const angle = (Math.PI * 2) / points;
  const angleHalf = angle / 2;

  const initialAngle = opts?.initialAngleRadian ?? -Math.PI / 2;
  if (innerRadius === undefined) innerRadius = outerRadius / 2;

  let a = initialAngle;
  const pts:Point[] = [];

  for (let index = 0; index < points; index++) {
    const peak = toCartesian(outerRadius, a, origin);
    const left = toCartesian(innerRadius, a - angleHalf, origin);
    const right = toCartesian(innerRadius, a + angleHalf, origin);

    pts.push(left, peak);
    if (index + 1 < points) pts.push(right);
    a += angle;
  }
  return pts;
};
