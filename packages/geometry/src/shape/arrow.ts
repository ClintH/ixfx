import type { Point } from "../point/point-type.js";
import { equilateralFromVertex } from "../triangle/create.js";
import type { Triangle } from "../triangle/triangle-type.js";
import { corners as RectsCorners } from '../rect/Corners.js';
import { fromTopLeft as RectsFromTopLeft } from '../rect/FromTopLeft.js';
import { rotate as PointsRotate } from "../point/rotate.js";
export type ArrowOpts = {
  readonly arrowSize?: number;
  readonly tailLength?: number;
  readonly tailThickness?: number;
  readonly angleRadian?: number;
};


/**
 * Returns the points forming an arrow.
 *
 * @example Create an arrow anchored by its tip at 100,100
 * ```js
 * const opts = {
 *  tailLength: 10,
 *  arrowSize: 20,
 *  tailThickness: 5,
 *  angleRadian: degreeToRadian(45)
 * }
 * const arrow = Shapes.arrow({x:100, y:100}, `tip`, opts); // Yields an array of points
 *
 * // Eg: draw points
 * Drawing.connectedPoints(ctx, arrow, {strokeStyle: `red`, loop: true});
 * ```
 *
 * @param origin Origin of arrow
 * @param from Does origin describe the tip, tail or middle?
 * @param opts Options for arrow
 * @returns
 */
export const arrow = (
  origin: Point,
  from: `tip` | `tail` | `middle`,
  opts: ArrowOpts = {}
): ReadonlyArray<Point> => {
  const tailLength = opts.tailLength ?? 10;
  const tailThickness = opts.tailThickness ?? Math.max(tailLength / 5, 5);
  const angleRadian = opts.angleRadian ?? 0;
  const arrowSize = opts.arrowSize ?? Math.max(tailLength / 5, 15);

  const triAngle = Math.PI / 2;

  let tri: Triangle;
  let tailPoints: ReadonlyArray<Point>;

  if (from === `tip`) {
    tri = equilateralFromVertex(origin, arrowSize, triAngle);
    tailPoints = RectsCorners(
      RectsFromTopLeft(
        { x: tri.a.x - tailLength, y: origin.y - tailThickness / 2 },
        tailLength,
        tailThickness
      )
    );
  } else if (from === `middle`) {
    const midX = tailLength + arrowSize / 2;
    const midY = tailThickness / 2;
    tri = equilateralFromVertex(
      {
        x: origin.x + arrowSize * 1.2,
        y: origin.y,
      },
      arrowSize,
      triAngle
    );

    tailPoints = RectsCorners(
      RectsFromTopLeft(
        { x: origin.x - midX, y: origin.y - midY },
        tailLength + arrowSize,
        tailThickness
      )
    );
  } else {
    //const midY = origin.y - tailThickness/2;
    tailPoints = RectsCorners(
      RectsFromTopLeft(
        { x: origin.x, y: origin.y - tailThickness / 2 },
        tailLength,
        tailThickness
      )
    );
    tri = equilateralFromVertex(
      { x: origin.x + tailLength + arrowSize * 0.7, y: origin.y },
      arrowSize,
      triAngle
    );
  }

  const arrow = PointsRotate(
    [
      tailPoints[ 0 ],
      tailPoints[ 1 ],
      tri.a,
      tri.b,
      tri.c,
      tailPoints[ 2 ],
      tailPoints[ 3 ],
    ],
    angleRadian,
    origin
  );

  return arrow;
};