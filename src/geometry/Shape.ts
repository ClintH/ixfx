import {toCartesian} from "./Polar.js";
import {integer as guardInteger} from "../Guards.js";
import {Point} from "./Point.js";

/**
 * Generates a starburst shape, returning an array of points.
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
 * @param points Number of points in the starburst. Defaults to five, which produces a typical star
 * @param innerRadius Inner radius. A proportionally smaller inner radius makes for sharper spikes. If unspecified, 50% of the outer radius is used.
 * @param outerRadius Outer radius. Maximum radius of a spike to origin
 * @param origin Origin, or {x:0:y:0} by default.
 */
export const starburst = (outerRadius:number, points:number = 5, innerRadius?:number, origin:Point = {x:0, y:0}, opts?:{readonly rotation:number}):readonly Point[] => {
  guardInteger(points, `positive`, `points`);
  const angle = Math.PI * 2 / points;
  const angleHalf = angle / 2;

  const rotation = opts?.rotation ?? 0;
  if (innerRadius === undefined) innerRadius = outerRadius/2;

  //eslint-disable-next-line functional/no-let
  let a = rotation;
  const pts = [];
  
  //eslint-disable-next-line functional/no-loop-statement,functional/no-let
  for (let i = 0; i < points; i++) {
    const peak = toCartesian(outerRadius, a, origin);
    const left = toCartesian(innerRadius, a - angleHalf, origin);
    const right = toCartesian(innerRadius, a + angleHalf, origin);

    //eslint-disable-next-line functional/immutable-data
    pts.push(left, peak);
    //eslint-disable-next-line functional/immutable-data
    if (i + 1 < points) pts.push(right);
    a += angle;
  }
  return pts;
};
