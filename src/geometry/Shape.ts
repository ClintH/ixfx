import { toCartesian } from "./Polar.js";
import { integer as guardInteger } from "../Guards.js";
import { Triangles, Points, Rects, Circles } from "./index.js";
import { CirclePositioned } from "./Circle.js";
import { RandomSource } from "~/Random.js";
import { RectPositioned } from "./Rect.js";

export type ContainsResult = `none`|`contained`

export type ShapePositioned = CirclePositioned | RectPositioned;

/**
 * Returns the intersection result between a and b.
 * @param a 
 * @param b 
 */
export const isIntersecting = (a:ShapePositioned, b:ShapePositioned|Points.Point):boolean => {
  if (Circles.isCirclePositioned(a)) {
    return Circles.isIntersecting(a, b);
  } else if (Rects.isRectPositioned(a)) {
    return Rects.isIntersecting(a, b);
  }
  throw new Error(`a or b are unknown shapes. a: ${JSON.stringify(a)} b: ${JSON.stringify(b)}`);
};

// export enum Quadrant {
//   Nw, Ne, Sw, Se
// }


export type RandomPointOpts = {
  readonly randomSource?:RandomSource
  readonly margin?:Points.Point
}

export const randomPoint = (shape:ShapePositioned, opts:RandomPointOpts = {}):Points.Point => {
  if (Circles.isCirclePositioned(shape)) {
    return Circles.randomPoint(shape, opts);
  } else if (Rects.isRectPositioned(shape)) {
    return Rects.randomPoint(shape, opts);
  }
  throw new Error(`Cannot create random point for unknown shape`);
};

// export type Shape = {
//   intersects(x:Points.Point|Shape):ContainsResult
//   readonly kind:`circular`

// }


/**
 * Returns the center of a shape
 * Shape can be: rectangle, triangle, circle
 * @param shape 
 * @returns 
 */
export const center = (shape?:Rects.Rect|Triangles.Triangle|Circles.Circle):Points.Point => {
  if (shape === undefined) {
    return Object.freeze({ x:0.5, y:0.5 });
  } else if (Rects.isRect(shape)) {
    return Rects.center(shape as Rects.Rect);
  } else if (Triangles.isTriangle(shape)) {
    return Triangles.centroid(shape);
  } else if (Circles.isCircle(shape)) {
    return Circles.center(shape);
  } else {
    throw new Error(`Unknown shape: ${JSON.stringify(shape)}`);
  }
};

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
export const starburst = (outerRadius:number, points:number = 5, innerRadius?:number, origin:Points.Point = { x:0, y:0 }, opts?:{readonly initialAngleRadian?:number}):readonly Points.Point[] => {
  guardInteger(points, `positive`, `points`);
  const angle = Math.PI * 2 / points;
  const angleHalf = angle / 2;

  const initialAngle = opts?.initialAngleRadian ?? -Math.PI/2;
  if (innerRadius === undefined) innerRadius = outerRadius/2;

  //eslint-disable-next-line functional/no-let
  let a = initialAngle;
  const pts = [];
  
  //eslint-disable-next-line functional/no-let
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


export type ArrowOpts = {
  readonly arrowSize?:number
  readonly tailLength?:number
  readonly tailThickness?:number
  readonly angleRadian?:number
}

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
export const arrow = (origin:Points.Point, from:`tip`|`tail`|`middle`, opts:ArrowOpts = {}):readonly Points.Point[] => {
  const tailLength = opts.tailLength ?? 10;
  const tailThickness = opts.tailThickness ?? Math.max(tailLength/5, 5);
  const angleRadian = opts.angleRadian ?? 0;
  const arrowSize = opts.arrowSize ?? Math.max(tailLength/5, 15);

  const triAngle = Math.PI/2;

  //eslint-disable-next-line functional/no-let
  let tri:Triangles.Triangle;
  //eslint-disable-next-line functional/no-let
  let tailPoints:readonly Points.Point[];

  if (from === `tip`) {
    tri = Triangles.equilateralFromVertex(origin, arrowSize, triAngle);
    tailPoints = Rects.corners(Rects.fromTopLeft(
      { x: tri.a.x - tailLength, y: origin.y - tailThickness / 2 },
      tailLength,
      tailThickness
    ));
  } else if (from === `middle`) {
    const midX = tailLength + arrowSize / 2;
    const midY = tailThickness / 2;
    tri = Triangles.equilateralFromVertex({
      x: origin.x + arrowSize*1.2,
      y: origin.y 
    }, arrowSize, triAngle);

    tailPoints = Rects.corners(Rects.fromTopLeft(
      { x: origin.x - midX, y: origin.y - midY },
      tailLength + arrowSize,
      tailThickness
    ));
  } else {
    //const midY = origin.y - tailThickness/2;
    tailPoints = Rects.corners(Rects.fromTopLeft({ x: origin.x, y: origin.y - tailThickness/2 }, tailLength, tailThickness));
    tri = Triangles.equilateralFromVertex({ x: origin.x + tailLength + arrowSize*0.7, y: origin.y }, arrowSize, triAngle);
  }

  const arrow = Points.rotate([
    tailPoints[0], tailPoints[1], tri.a,
    tri.b,
    tri.c, tailPoints[2], tailPoints[3]
  ], angleRadian, origin);

  return arrow;
};
