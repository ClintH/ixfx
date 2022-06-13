import {Points, Lines,  radianToDegree, Polar, Circles} from './index.js';
import {number as guardNumber} from '../Guards.js';

const piPi = Math.PI*2;
export type Triangle = {
  readonly a: Points.Point,
  readonly b: Points.Point,
  readonly c: Points.Point
}

//eslint-disable-next-line @typescript-eslint/naming-convention
export const Empty = Object.freeze({a: Points.Empty, b:Points.Empty, c:Points.Empty});
//eslint-disable-next-line @typescript-eslint/naming-convention
export const Placeholder = Object.freeze({a: Points.Placeholder, b:Points.Placeholder, c:Points.Placeholder});

export const isEmpty = (t: Triangle): boolean => Points.isEmpty(t.a) && Points.isEmpty(t.b) && Points.isEmpty(t.c);
export const isPlaceholder = (t: Triangle): boolean => Points.isPlaceholder(t.a) && Points.isPlaceholder(t.b) && Points.isPlaceholder(t.c);

export const apply = (t:Triangle, fn:(p:Points.Point) => Points.Point) => Object.freeze<Triangle>(
  {
    ...t,
    a: fn(t.a),
    b: fn(t.b),
    c: fn(t.c),
  }
);

export const guard = (t: Triangle, name: string = `t`) => {
  if (t === undefined) throw Error(`{$name} undefined`);
  Points.guard(t.a, name + `.a`);
  Points.guard(t.b, name + `.b`);
  Points.guard(t.c, name + `.c`);
};

export const isTriangle = (p: number | unknown): p is Triangle => {
  if (p === undefined) return false;
  const tri = p as Triangle;
  if (!Points.isPoint(tri.a)) return false;
  if (!Points.isPoint(tri.b)) return false;
  if (!Points.isPoint(tri.c)) return false;
  return true; 
};

export const isEqual = (a: Triangle, b: Triangle): boolean => Points.isEqual(a.a, b.a) && Points.isEqual(a.b, b.b) && Points.isEqual(a.c, b.c);

export const corners = (t:Triangle):readonly Points.Point[] => {
  guard(t);
  return [t.a, t.b, t.c];
};

export const edges = (t:Triangle):Lines.PolyLine => {
  guard(t);
  return Lines.joinPointsToLines(t.a, t.b, t.c, t.a);
};

export const lengths = (t:Triangle):readonly number[] => {
  guard(t);
  return [
    Points.distance(t.a, t.b),
    Points.distance(t.b, t.c),
    Points.distance(t.c, t.a)
  ];
};

export const angles = (t:Triangle):readonly number[] => {
  guard(t);
  return [
    Points.angleBetween(t.a, t.b),
    Points.angleBetween(t.b, t.c),
    Points.angleBetween(t.c, t.a)
  ];
};

export const anglesDegrees = (t:Triangle):readonly number[] => {
  guard(t);
  return radianToDegree(angles(t));
};


export const isEquilateral = (t:Triangle):boolean => {
  guard(t);
  const [a, b, c] = lengths(t);
  return a === b && b === c;
};

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
  console.log(`p ${p}`);
  const a = area(t);
  console.log(`a ${a}`);
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
export const equilateralFromOrigin = (origin:Points.Point, radius:number, opts:{readonly initialAngleRadian?:number} = {}):Triangle => {
  guardNumber(radius, `positive`, `radius`);
  Points.guard(origin, `origin`);

  const initialAngleRadian = opts.initialAngleRadian ?? 0;

  const angles = [initialAngleRadian, initialAngleRadian + piPi*1/3, initialAngleRadian + piPi*2/3];
  const points = angles.map(a => Polar.toCartesian(radius, a, origin));
  return fromPoints(points);
};

export const fromPoints = (pts:readonly Points.Point[]):Triangle => {
  if (pts === undefined) throw new Error(`pts undefined`);
  if (pts.length !== 3) throw new Error(`Expected 3 elements in pts. Got ${pts.length}`);
  const t:Triangle = {
    a: pts[0],
    b: pts[1],
    c: pts[2]
  };
  return t;
};

// contains
// area
// midpoint
