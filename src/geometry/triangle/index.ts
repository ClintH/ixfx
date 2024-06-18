import * as Polar from '../Polar.js';
import * as Points from '../point/index.js';
import { throwNumberTest } from "../../util/GuardNumbers.js";
import { radianToDegree } from '../Angles.js';
import { guard } from './Guard.js';
import { intersectsPoint as RectsIntersectsPoint } from '../rect/Intersects.js';
import type { RectPositioned } from '../Types.js';
import type { Point } from '../point/PointType.js';
import { getPointParameter } from '../point/GetPointParameter.js';
import type { Triangle } from './TriangleType.js';

export * from './Area.js';
export * from './Centroid.js';
export * from './Edges.js';
export * from './InnerCircle.js';
export * from './Guard.js';
export * from './OuterCircle.js';
export * from './Perimeter.js';
export * from './Rotate.js';
/**
 * Functions for working with equilateral triangles, defined by length
 */
export * as Equilateral from './Equilateral.js';

/**
 * Functions for working with right-angled triangles, defined by two of three edges
 */
export * as Right from './Right.js';

export * as Isosceles from './Isosceles.js';

/**
* Triangle.
*
* Helpers for creating:
*  - {@link Triangles.fromFlatArray}: Create from [x1, y1, x2, y2, x3, y3]
*  - {@link Triangles.fromPoints}: Create from three `{x,y}` sets
*  - {@link Triangles.fromRadius}: Equilateral triangle of a given radius and center
*/


const piPi = Math.PI * 2;

/**
 * A triangle consisting of three empty points (Points.Empty)
 */
//eslint-disable-next-line @typescript-eslint/naming-convention
export const Empty = Object.freeze({
  a: { x: 0, y: 0 },
  b: { x: 0, y: 0 },
  c: { x: 0, y: 0 },
});

/**
 * A triangle consisting of three placeholder points (Points.Placeholder)
 */
//eslint-disable-next-line @typescript-eslint/naming-convention
export const Placeholder = Object.freeze({
  a: { x: Number.NaN, y: Number.NaN },
  b: { x: Number.NaN, y: Number.NaN },
  c: { x: Number.NaN, y: Number.NaN },
});

/**
 * Returns true if triangle is empty
 * @param t
 * @returns
 */
export const isEmpty = (t: Triangle): boolean =>
  Points.isEmpty(t.a) && Points.isEmpty(t.b) && Points.isEmpty(t.c);

/**
 * Returns true if triangle is a placeholder
 * @param t
 * @returns
 */
export const isPlaceholder = (t: Triangle): boolean =>
  Points.isPlaceholder(t.a) &&
  Points.isPlaceholder(t.b) &&
  Points.isPlaceholder(t.c);

/**
 * Applies `fn` to each of a triangle's corner points, returning the result.
 *
 * @example Add some random to the x of each corner
 * ```
 * const t = apply(tri, p => {
 *  const r = 10;
 *  return {
 *    x: p.x + (Math.random()*r*2) - r,
 *    y: p.y
 *  }
 * });
 * ```
 * @param t
 * @param fn
 * @returns
 */
export const apply = (
  t: Triangle,
  fn: (p: Point, label?: string) => Point
) =>
  Object.freeze<Triangle>({
    ...t,
    a: fn(t.a, `a`),
    b: fn(t.b, `b`),
    c: fn(t.c, `c`),
  });



/**
 * Returns true if the parameter appears to be a valid triangle
 * @param p
 * @returns
 */
export const isTriangle = (p: unknown): p is Triangle => {
  if (p === undefined) return false;
  const tri = p as Triangle;
  if (!Points.isPoint(tri.a)) return false;
  if (!Points.isPoint(tri.b)) return false;
  if (!Points.isPoint(tri.c)) return false;
  return true;
};

/**
 * Returns true if the two parameters have equal values
 * @param a
 * @param b
 * @returns
 */
export const isEqual = (a: Triangle, b: Triangle): boolean =>
  Points.isEqual(a.a, b.a) &&
  Points.isEqual(a.b, b.b) &&
  Points.isEqual(a.c, b.c);

/**
 * Returns the corners (vertices) of the triangle as an array of points
 * @param t
 * @returns Array of length three
 */
export const corners = (t: Triangle): ReadonlyArray<Point> => {
  guard(t);
  return [ t.a, t.b, t.c ];
};



/**
 * Returns the lengths of the triangle sides
 * @param t
 * @returns Array of length three
 */
export const lengths = (t: Triangle): ReadonlyArray<number> => {
  guard(t);
  return [
    Points.distance(t.a, t.b),
    Points.distance(t.b, t.c),
    Points.distance(t.c, t.a),
  ];
};

/**
 * Return the three interior angles of the triangle, in radians.
 * @param t
 * @returns
 */
export const angles = (t: Triangle): ReadonlyArray<number> => {
  guard(t);
  return [
    Points.angle(t.a, t.b),
    Points.angle(t.b, t.c),
    Points.angle(t.c, t.a),
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


/**
 * Returns an equilateral triangle centered at the origin.
 *
 * ```js
 * // Create a triangle at 100,100 with radius of 60
 * const tri = fromRadius({x:100,y:100}, 60);
 *
 * // Triangle with point A upwards, B to the right, C to the left
 * constr tri2 = fromRadius({x:100,y:100}, 60, {initialAngleRadian: -Math.PI / 2});
 * ```
 *
 *
 * @param origin Origin
 * @param radius Radius of triangle
 * @param opts Options
 */
export const fromRadius = (
  origin: Point,
  radius: number,
  opts: { readonly initialAngleRadian?: number } = {}
): Triangle => {
  throwNumberTest(radius, `positive`, `radius`);
  Points.guard(origin, `origin`);

  const initialAngleRadian = opts.initialAngleRadian ?? 0;

  const angles = [
    initialAngleRadian,
    initialAngleRadian + (piPi * 1) / 3,
    initialAngleRadian + (piPi * 2) / 3,
  ];
  const points = angles.map((a) => Polar.toCartesian(radius, a, origin));
  return fromPoints(points);
};

/**
 * Rotates the vertices of the triangle around one point (by default, `b`).
 * @param triangle Triangle
 * @param vertex Name of vertex: a, b or c.
 */
export const rotateByVertex = (
  triangle: Triangle,
  amountRadian: number,
  vertex: `a` | `b` | `c` = `b`
): Triangle => {
  const origin =
    vertex === `a` ? triangle.a : (vertex === `b` ? triangle.b : triangle.c);
  return Object.freeze({
    a: Points.rotate(triangle.a, amountRadian, origin),
    b: Points.rotate(triangle.b, amountRadian, origin),
    c: Points.rotate(triangle.c, amountRadian, origin),
  });
};

/**
 * Returns a triangle anchored at `origin` with a given `length` and `angleRadian`.
 * The origin will be point `b` of the triangle, and the angle will be the angle for b.
 * @param origin Origin
 * @param length Length
 * @param angleRadian Angle
 * @returns
 */
export const equilateralFromVertex = (
  origin?: Point,
  length = 10,
  angleRadian: number = Math.PI / 2
): Triangle => {
  if (!origin) origin = Object.freeze({ x: 0, y: 0 })

  const a = Points.project(origin, length, Math.PI - -angleRadian / 2);
  const c = Points.project(origin, length, Math.PI - angleRadian / 2);
  return { a, b: origin, c };
};

/**
 * Returns the coordinates of triangle in a flat array form:
 * [xA, yA, xB, yB, xC, yC]
 * @param t
 * @returns
 */
export const toFlatArray = (t: Triangle): ReadonlyArray<number> => {
  guard(t);
  return [ t.a.x, t.a.y, t.b.x, t.b.y, t.c.x, t.c.y ];
};

/**
 * Returns a triangle from a set of coordinates in a flat array form:
 * [xA, yA, xB, yB, xC, yC]
 * @param coords
 * @returns
 */
export const fromFlatArray = (coords: ReadonlyArray<number>): Triangle => {
  if (!Array.isArray(coords)) throw new Error(`coords expected as array`);
  if (coords.length !== 6) {
    throw new Error(
      `coords array expected with 6 elements. Got ${ coords.length }`
    );
  }
  return fromPoints(Points.fromNumbers(...coords));
};

/**
 * Returns a triangle from an array of three points
 * @param points
 * @returns
 */
export const fromPoints = (points: ReadonlyArray<Point>): Triangle => {
  if (!Array.isArray(points)) throw new Error(`points expected as array`);
  if (points.length !== 3) {
    throw new Error(
      `points array expected with 3 elements. Got ${ points.length }`
    );
  }
  const t: Triangle = {
    a: points[ 0 ],
    b: points[ 1 ],
    c: points[ 2 ],
  };
  return t;
};

/**
 * Returns the bounding box that encloses the triangle.
 * @param t
 * @param inflation If specified, box will be inflated by this much. Default: 0.
 * @returns
 */
export const bbox = (t: Triangle, inflation = 0): RectPositioned => {
  const { a, b, c } = t;
  const xMin = Math.min(a.x, b.x, c.x) - inflation;
  const xMax = Math.max(a.x, b.x, c.x) + inflation;
  const yMin = Math.min(a.y, b.y, c.y) - inflation;
  const yMax = Math.max(a.y, b.y, c.y) + inflation;

  const r: RectPositioned = {
    x: xMin,
    y: yMin,
    width: xMax - xMin,
    height: yMax - yMin,
  };
  return r;
};

export type BarycentricCoord = {
  readonly a: number;
  readonly b: number;
  readonly c: number;
};

/**
 * Returns the [Barycentric coordinate](https://en.wikipedia.org/wiki/Barycentric_coordinate_system) of a point within a triangle
 *
 * @param t
 * @param a
 * @param b
 * @returns
 */
export const barycentricCoord = (
  t: Triangle,
  a: Point | number,
  b?: number
): BarycentricCoord => {
  const pt = getPointParameter(a, b);

  const ab = (x: number, y: number, pa: Point, pb: Point) =>
    (pa.y - pb.y) * x + (pb.x - pa.x) * y + pa.x * pb.y - pb.x * pa.y;

  const alpha = ab(pt.x, pt.y, t.b, t.c) / ab(t.a.x, t.a.y, t.b, t.c);
  const theta = ab(pt.x, pt.y, t.c, t.a) / ab(t.b.x, t.b.y, t.c, t.a);
  const gamma = ab(pt.x, pt.y, t.a, t.b) / ab(t.c.x, t.c.y, t.a, t.b);

  return {
    a: alpha,
    b: theta,
    c: gamma,
  };
};

/**
 * Convert Barycentric coordinate to Cartesian
 * @param t
 * @param bc
 * @returns
 */
export const barycentricToCartestian = (
  t: Triangle,
  bc: BarycentricCoord
): Point => {
  guard(t);
  const { a, b, c } = t;

  const x = a.x * bc.a + b.x * bc.b + c.x * bc.c;
  const y = a.y * bc.a + b.y * bc.b + c.y * bc.c;

  if (a.z && b.z && c.z) {
    const z = a.z * bc.a + b.z * bc.b + c.z * bc.c;
    return Object.freeze({ x, y, z });
  } else {
    return Object.freeze({ x, y });
  }
};

/**
 * Returns true if point is within or on the boundary of triangle
 * @param t
 * @param a
 * @param b
 */
export const intersectsPoint = (
  t: Triangle,
  a: Point | number,
  b?: number
): boolean => {
  const box = bbox(t);

  const pt = getPointParameter(a, b);

  // If it's not in the bounding box, can return false straight away
  if (!RectsIntersectsPoint(box, pt)) return false;

  const bc = barycentricCoord(t, pt);

  return (
    0 <= bc.a && bc.a <= 1 && 0 <= bc.b && bc.b <= 1 && 0 <= bc.c && bc.c <= 1
  );
};
