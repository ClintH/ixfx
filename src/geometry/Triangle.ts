import {Points, Lines,  radianToDegree, Polar, Circles, Rects} from './index.js';
import {number as guardNumber} from '../Guards.js';

const piPi = Math.PI*2;

/**
 * Triangle.
 * 
 * Helpers for creating:
 *  - {@link fromFlatArray}: Create from [x1, y1, x2, y2, x3, y3]
 *  - {@link fromPoints}: Create from three {x,y} sets
 *  - {@link fromRadius}: Equilateral triangle of a given radius and center
 */
export type Triangle = {
  readonly a: Points.Point,
  readonly b: Points.Point,
  readonly c: Points.Point
}

/**
 * A triangle consisting of three empty points (Points.Empty)
 */
//eslint-disable-next-line @typescript-eslint/naming-convention
export const Empty = Object.freeze({a: Points.Empty, b:Points.Empty, c:Points.Empty});

/**
 * A triangle consisting of three placeholder points (Points.Placeholder)
 */
//eslint-disable-next-line @typescript-eslint/naming-convention
export const Placeholder = Object.freeze({a: Points.Placeholder, b:Points.Placeholder, c:Points.Placeholder});

/**
 * Returns true if triangle is empty
 * @param t 
 * @returns 
 */
export const isEmpty = (t: Triangle): boolean => Points.isEmpty(t.a) && Points.isEmpty(t.b) && Points.isEmpty(t.c);

/**
 * Returns true if triangle is a placeholder
 * @param t 
 * @returns 
 */
export const isPlaceholder = (t: Triangle): boolean => Points.isPlaceholder(t.a) && Points.isPlaceholder(t.b) && Points.isPlaceholder(t.c);

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
export const apply = (t:Triangle, fn:(p:Points.Point, label?:string) => Points.Point) => Object.freeze<Triangle>(
  {
    ...t,
    a: fn(t.a, `a`),
    b: fn(t.b, `b`),
    c: fn(t.c, `c`),
  }
);

/**
 * Throws an exception if the triangle is invalid
 * @param t 
 * @param name 
 */
export const guard = (t: Triangle, name: string = `t`) => {
  if (t === undefined) throw Error(`{$name} undefined`);
  Points.guard(t.a, name + `.a`);
  Points.guard(t.b, name + `.b`);
  Points.guard(t.c, name + `.c`);
};

/**
 * Returns true if the parameter appears to be a valid triangle
 * @param p 
 * @returns 
 */
export const isTriangle = (p: number | unknown): p is Triangle => {
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
export const isEqual = (a: Triangle, b: Triangle): boolean => Points.isEqual(a.a, b.a) && Points.isEqual(a.b, b.b) && Points.isEqual(a.c, b.c);

/**
 * Returns the corners (vertices) of the triangle as an array of points
 * @param t 
 * @returns Array of length three
 */
export const corners = (t:Triangle):readonly Points.Point[] => {
  guard(t);
  return [t.a, t.b, t.c];
};

/**
 * Returns the edges (ie sides) of the triangle as an array of lines
 * @param t 
 * @returns Array of length three
 */
export const edges = (t:Triangle):Lines.PolyLine => {
  guard(t);
  return Lines.joinPointsToLines(t.a, t.b, t.c, t.a);
};

/**
 * Returns the lengths of the triangle sides
 * @param t 
 * @returns Array of length three
 */
export const lengths = (t:Triangle):readonly number[] => {
  guard(t);
  return [
    Points.distance(t.a, t.b),
    Points.distance(t.b, t.c),
    Points.distance(t.c, t.a)
  ];
};

/**
 * Return the three interior angles of the triangle, in radians. 
 * @param t 
 * @returns 
 */
export const angles = (t:Triangle):readonly number[] => {
  guard(t);
  return [
    Points.angleBetween(t.a, t.b),
    Points.angleBetween(t.b, t.c),
    Points.angleBetween(t.c, t.a)
  ];
};

/**
 * Returns the three interior angles of the triangle, in degrees
 * @param t 
 * @returns 
 */
export const anglesDegrees = (t:Triangle):readonly number[] => {
  guard(t);
  return radianToDegree(angles(t));
};

/**
 * Returns true if it is an equilateral triangle
 * @param t 
 * @returns 
 */
export const isEquilateral = (t:Triangle):boolean => {
  guard(t);
  const [a, b, c] = lengths(t);
  return a === b && b === c;
};

/**
 * Returns true if it is an isoceles triangle
 * @param t
 * @returns 
 */
export const isIsoceles = (t:Triangle):boolean => {
  const [a, b, c] = lengths(t);
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
export const isRightAngle = (t:Triangle):boolean => (angles(t).some(v => v === Math.PI/2));

/**
 * Returns true if triangle is oblique: No interior angle is 90 degrees
 * @param t 
 * @returns 
 */
export const isOblique = (t:Triangle):boolean => !isRightAngle(t);

/**
 * Returns true if triangle is actue: all interior angles less than 90 degrees
 * @param t 
 * @returns 
 */
export const isAcute = (t:Triangle):boolean => (!angles(t).some(v => v >= Math.PI/2));

/**
 * Returns true if triangle is obtuse: at least one interior angle is greater than 90 degrees
 * @param t 
 * @returns 
 */
export const isObtuse = (t:Triangle):boolean => (angles(t).some(v => v > Math.PI/2));

/**
 * Returns simple centroid of triangle
 * @param t 
 * @returns 
 */
export const centroid = (t:Triangle):Points.Point => {
  guard(t);
  const total = Points.reduce([t.a, t.b, t.c], (p:Points.Point, acc:Points.Point) => ({
    x: p.x + acc.x,
    y: p.y + acc.y
  }));
  const div = {
    x: total.x / 3,
    y: total.y / 3
  };
  return div;
};

/**
 * Calculates perimeter of a triangle
 * @param t 
 * @returns 
 */
export const perimeter = (t:Triangle):number => {
  guard(t);
  return edges(t).reduce<number>((acc, v) => acc + Lines.length(v), 0);
};

/**
 * Calculates the area of a triangle
 * @param t 
 * @returns 
 */
export const area = (t:Triangle):number => {
  guard(t, `t`);

  // Get length of edges
  const e = edges(t).map(l => Lines.length(l));

  // Add up length of edges, halve
  const p = (e[0] + e[1] + e[2]) / 2;
  return Math.sqrt(p * (p - e[0]) * (p - e[1]) * (p - e[2]));
};

/**
 * Returns the largest circle enclosed by triangle `t`.
 * @param t 
 */
export const innerCircle = (t:Triangle):Circles.CirclePositioned => {
  const c = centroid(t);
  const p = perimeter(t) / 2;
  const a = area(t);
  const radius = a / p;
  return {radius, ...c};
};

/**
 * Returns the largest circle touching the corners of triangle `t`.
 * @param t 
 * @returns 
 */
export const outerCircle = (t:Triangle):Circles.CirclePositioned => {
  const [a, b, c]= edges(t).map(l => Lines.length(l));
  const cent = centroid(t);
  const radius = a*b*c / Math.sqrt((a+b+c)*(-a+b+c)*(a-b+c)*(a+b-c));
  return {
    radius,
    ...cent
  };
};

/**
 * Returns an equilateral triangle centered at the origin.
 * 
 * ```js
 * // Create a triangle at 100,100 with radius of 60
 * const tri = equilateralFromOrigin({x:100,y:100}, 60);
 * 
 * // Triangle with point A upwards, B to the right, C to the left
 * constr tri2 = equilateralFromOrigin({x:100,y:100}, 60, {initialAngleRadian: -Math.PI / 2});
 * ```
 * 
 * 
 * @param origin 
 * @param length 
 */
export const fromRadius = (origin:Points.Point, radius:number, opts:{readonly initialAngleRadian?:number} = {}):Triangle => {
  guardNumber(radius, `positive`, `radius`);
  Points.guard(origin, `origin`);

  const initialAngleRadian = opts.initialAngleRadian ?? 0;

  const angles = [initialAngleRadian, initialAngleRadian + piPi*1/3, initialAngleRadian + piPi*2/3];
  const points = angles.map(a => Polar.toCartesian(radius, a, origin));
  return fromPoints(points);
};


/**
 * Returns the coordinates of triangle in a flat array form:
 * [xA, yA, xB, yB, xC, yC]
 * @param t 
 * @returns 
 */
export const toFlatArray = (t:Triangle): readonly number[] => {
  guard(t);
  return [
    t.a.x, t.a.y,
    t.b.x, t.b.y,
    t.c.x, t.c.y
  ];
};

/**
 * Returns a triangle from a set of coordinates in a flat array form:
 * [xA, yA, xB, yB, xC, yC]
 * @param coords 
 * @returns 
 */
export const fromFlatArray = (coords: readonly number[]): Triangle => {
  if (!Array.isArray(coords)) throw new Error(`coords expected as array`);
  if (coords.length !== 6) throw new Error(`coords array expected with 6 elements. Got ${coords.length}`);
  return fromPoints(Points.fromNumbers(...coords));
};

/**
 * Returns a triangle from an array of three points
 * @param points 
 * @returns 
 */
export const fromPoints = (points: readonly Points.Point[]):Triangle => {
  if (!Array.isArray(points)) throw new Error(`points expected as array`);
  if (points.length !== 3) throw new Error(`points array expected with 3 elements. Got ${points.length}`);
  const t:Triangle = {
    a: points[0],
    b: points[1],
    c: points[2]
  };
  return t;
};

/**
 * Returns the bounding box that encloses the triangle.
 * @param t 
 * @param inflation If specified, box will be inflated by this much. Default: 0.
 * @returns 
 */
export const bbox = (t:Triangle, inflation = 0):Rects.RectPositioned => {
  const {a, b, c} = t;
  const xMin = Math.min(a.x, b.x, c.x) - inflation;
  const xMax = Math.max(a.x, b.x, c.x) + inflation;
  const yMin = Math.min(a.y, b.y, c.y) - inflation;
  const yMax = Math.max(a.y, b.y, c.y) + inflation;

  const r:Rects.RectPositioned = {
    x: xMin,
    y: yMin,
    width: xMax - xMin,
    height: yMax - yMin  
  };
  return r;
};

export type BarycentricCoord = {
  readonly a: number
  readonly b: number,
  readonly c: number
}

/**
 * Returns the Barycentric coordinate of a point within a triangle
 * {@link https://en.wikipedia.org/wiki/Barycentric_coordinate_system}
 * @param t 
 * @param a 
 * @param b 
 * @returns 
 */
export const barycentricCoord = (t:Triangle, a:Points.Point|number, b?:number):BarycentricCoord => {
  const pt = Points.getPointParam(a, b);

  const ab = (x:number, y:number, pa:Points.Point, pb:Points.Point) => (pa.y - pb.y) * x + (pb.x - pa.x) * y + pa.x*pb.y - pb.x*pa.y;
  
  const alpha = ab(pt.x, pt.y, t.b, t.c) / ab(t.a.x, t.a.y, t.b, t.c);
  const theta = ab(pt.x, pt.y, t.c, t.a) / ab(t.b.x, t.b.y, t.c, t.a);
  const gamma = ab(pt.x, pt.y, t.a, t.b) / ab(t.c.x, t.c.y, t.a, t.b);

  return {
    a:alpha,
    b:theta,
    c:gamma
  };
};

/**
 * Convert Barycentric coordinate to Cartesian
 * @param t 
 * @param bc 
 * @returns 
 */
export const barycentricToCartestian = (t:Triangle, bc:BarycentricCoord): Points.Point => {
  guard(t);
  const {a, b, c} = t;
  
  const x = a.x*bc.a + b.x*bc.b + c.x*bc.c;
  const y = a.y*bc.a + b.y*bc.b + c.y*bc.c;
  
  if (a.z && b.z && c.z) {
    const z = a.z*bc.a + b.z*bc.b + c.z*bc.c;
    return Object.freeze({x, y, z});
  } else {
    return Object.freeze({x, y});
  }
};

/**
 * Returns true if point is within or on the boundary of triangle
 * @param t 
 * @param a 
 * @param b 
 */
export const intersectsPoint = (t:Triangle, a:Points.Point|number, b?:number):boolean => {
  const box = bbox(t);

  const pt = Points.getPointParam(a, b);

  // If it's not in the bounding box, can return false straight away
  if (!Rects.intersectsPoint(box, pt)) return false;

  const bc = barycentricCoord(t, pt);

  return 0 <= bc.a && bc.a <= 1 && 0 <= bc.b && bc.b <= 1 && 0 <= bc.c && bc.c <= 1;
};

/**
 * Returns a triangle that is rotated by `angleRad`. By default it rotates
 * around its center but an arbitrary `origin` point can be provided.
 * 
 * ```js
 * // Rotate triangle by 5 degrees
 * rotate(triangle, degreeToRadian(5));
 * 
 * // Rotate by 90 degrees
 * rotate(triangle, Math.PI / 2);
 * ```
 * @param line Line to rotate
 * @param amountRadian Angle in radians to rotate by
 * @param origin Point to rotate around. If undefined, middle of line will be used
 * @returns 
 */
export const rotate = (t:Triangle, amountRadian?:number, origin?:Points.Point):Triangle => {
  if (amountRadian === undefined || amountRadian === 0) return t;
  if (origin === undefined) origin = centroid(t);
  return Object.freeze({
    ...t,
    a: Points.rotate(t.a, amountRadian, origin),
    b: Points.rotate(t.b, amountRadian, origin),
    c: Points.rotate(t.c, amountRadian, origin)
  });
};