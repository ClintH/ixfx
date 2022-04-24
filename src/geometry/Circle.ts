import {guard as guardPoint} from './Point.js';
import {Path} from './Path.js';
import {Line} from './Line.js';
import {Points, Rects} from  './index.js';

const piPi = Math.PI *2;

/**
 * A circle
 */
export type Circle = {
  readonly radius: number
}

/**
 * A {@link Circle} with position
 */
export type CirclePositioned = Points.Point & Circle;


export type CircularPath = Circle & Path & {
  readonly kind: `circular`
};

/**
 * Returns true if parameter has x,y. Does not verify if parameter is a circle or not
 * @param p Circle or point
 * @returns 
 */
export const isPositioned = (p: Circle | Points.Point): p is Points.Point => (p as Points.Point).x !== undefined && (p as Points.Point).y !== undefined;
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isCircle = (p: Circle|CirclePositioned|any): p is Circle => (p as Circle).radius !== undefined;
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isCirclePositioned = (p:Circle|CirclePositioned|any): p is CirclePositioned => isCircle(p) && isPositioned(p);

/**
 * Returns a point on a circle at a specified angle in radians
 * @param circle
 * @param angleRadian Angle in radians
 * @param Origin or offset of calculated point. By default uses center of circle or 0,0 if undefined
 * @returns Point oo circle
 */
export const point = (circle:Circle|CirclePositioned, angleRadian:number, origin?:Points.Point): Points.Point => {
  if (origin === undefined) {
    if (isPositioned(circle)) {
      origin = circle;
    } else {
      origin = {x:0, y:0};
    }
  }
  return {
    x: (Math.cos(-angleRadian) * circle.radius) + origin.x,
    y: (Math.sin(-angleRadian) * circle.radius) + origin.y
  };
};

/**
 * Throws if radius is out of range. If x,y is present, these will be validated too.
 * @param circle 
 * @param paramName 
 */
const guard = (circle:CirclePositioned|Circle, paramName =`circle`) => {
  if (isPositioned(circle)) {
    guardPoint(circle, `circle`);
  }

  if (Number.isNaN(circle.radius)) throw new Error(`${paramName}.radius is NaN`);
  if (circle.radius <= 0) throw new Error(`${paramName}.radius must be greater than zero`);
};

/**
 * Throws if `circle` is not positioned or has dodgy fields
 * @param circle 
 * @param paramName 
 * @returns 
 */
const guardPositioned = (circle:CirclePositioned, paramName = `circle`) => {
  if (!isPositioned(circle)) throw new Error(`Expected a positioned circle with x,y`);
  return guard(circle, paramName);
};

/**
 * Computes relative position along circle
 * @param circle 
 * @param t Position, 0-1
 * @returns 
 */
export const interpolate = (circle:CirclePositioned, t:number):Points.Point => point(circle, t*piPi);

/**
 * Returns circumference of circle
 * @param circle 
 * @returns 
 */
export const length = (circle:Circle):number => piPi*circle.radius;

/**
 * Computes a bounding box that encloses circle
 * @param circle
 * @returns 
 */
export const bbox = (circle:CirclePositioned|Circle):Rects.RectPositioned|Rects.Rect => {
  if (isPositioned(circle)) {
    return Rects.fromCenter(circle, circle.radius*2, circle.radius*2);
  } else {
    return {width: circle.radius*2, height: circle.radius*2};
  }
};

/**
 * Returns true if `b` is completely contained by `a`
 *
 * @param a
 * @param b
 * @returns
 */
export const isContainedBy = (a:CirclePositioned, b:CirclePositioned):boolean => {
  const d = distanceCenter(a, b);
  return (d < Math.abs(a.radius - b.radius));
};

/**
 * Returns true if a or b overlap or are equal
 * 
 * Use `intersections` to find the points of intersection
 *
 * @param a
 * @param b
 * @returns True if circle overlap
 */
export const isIntersecting = (a:CirclePositioned, b:CirclePositioned):boolean => {
  if (isEquals(a, b)) return true;
  if (isContainedBy(a, b)) return true;
  return intersections(a, b).length === 2;
};

/**
 * Returns the points of intersection betweeen `a` and `b`.
 * 
 * Returns an empty array if circles are equal, one contains the other or if they don't touch at all.
 *
 * @param a Circle
 * @param b Circle
 * @returns Points of intersection, or an empty list if there are none
 */
export const intersections = (a:CirclePositioned, b:CirclePositioned):readonly Points.Point[] => {
  const vector = Points.subtract(b, a);
  const centerD = Math.sqrt((vector.y*vector.y) + (vector.x*vector.x));

  // Do not intersect
  if (centerD > a.radius + b.radius) return [];

  // Circle contains another
  if (centerD < Math.abs(a.radius - b.radius)) return [];

  // Circles are the same
  if (isEquals(a, b)) return [];

  const centroidD = ((a.radius*a.radius) - (b.radius*b.radius) + (centerD*centerD)) / (2.0 * centerD);
  const centroid = {
    x: a.x + (vector.x * centroidD / centerD),
    y: a.y + (vector.y * centroidD / centerD)
  };

  const centroidIntersectionD = Math.sqrt((a.radius*a.radius) - (centroidD*centroidD));

  const intersection =  {
    x: -vector.y * (centroidIntersectionD/centerD),
    y: vector.x * (centroidIntersectionD/centerD)
  };
  return [
    Points.sum(centroid, intersection),
    Points.subtract(centroid, intersection)
  ];
};

/**
 * Returns true if the two objects have the same values
 *
 * @param a
 * @param b
 * @returns
 */
export const isEquals = (a:CirclePositioned|Circle, b:CirclePositioned|Circle):boolean => {
  if (a.radius !== b.radius) return false;

  if (isPositioned(a) && isPositioned(b)) {
    if (a.x !== b.x) return false;
    if (a.y !== b.y) return false;
    if (a.z !== b.z) return false;
    return true;
  } else if (!isPositioned(a) && !isPositioned(b)) {
    // no-op
  } else return false; // one is positioned one not

  return false;
};

/**
 * Returns the distance between two circle centers.
 * 
 * Throws an error if either is lacking position.
 * @param a 
 * @param b 
 * @returns Distance
 */
export const distanceCenter = (a:CirclePositioned, b:CirclePositioned):number => {
  guardPositioned(a, `a`);
  guardPositioned(a, `b`);
  return Points.distance(a, b);
};

/**
 * Returns the distance between the exterior of two circles, or between the exterior of a circle and point.
 * If `b` overlaps or is enclosed by `a`, distance is 0.
 * @param a
 * @param b 
 */
export const distanceFromExterior = (a:CirclePositioned, b:CirclePositioned|Points.Point):number => {
  guardPositioned(a, `a`);
  if (isCirclePositioned(b)) {
    return Math.max(0, distanceCenter(a, b) - a.radius - b.radius);
  } else if (Points.isPoint(b)) {
    return Math.max(0, Points.distance(a, b));
  } else throw new Error(`Second parameter invalid type`);
};

type ToSvg = {
  (radius:number, sweep:boolean, origin:Points.Point): readonly string[];
  (circle:Circle, sweep:boolean, origin:Points.Point): readonly string[];
  (circle:CirclePositioned, sweep:boolean): readonly string[];
};


/**
 * Creates a SVG path segment.
 * @param a Circle or radius
 * @param sweep If true, path is 'outward'
 * @param origin Origin of path. Required if first parameter is just a radius or circle is non-positioned
 * @returns 
 */
export const toSvg:ToSvg = (a:CirclePositioned|number|Circle, sweep:boolean, origin?:Points.Point):readonly string[] => {
  if (isCircle(a)) {
    if (origin !== undefined) {
      return toSvgFull(a.radius, origin, sweep);
    }
    if (isPositioned(a)) {
      return toSvgFull(a.radius, a, sweep);
    } else throw new Error(`origin parameter needed for non-positioned circle`);
  } else {
    if (origin !== undefined) {
      return toSvgFull(a, origin, sweep);
    } else throw new Error(`origin parameter needed`);
  }  
};

const toSvgFull = (radius:number, origin:Points.Point, sweep:boolean):readonly string[] => {
  // https://stackoverflow.com/questions/5737975/circle-drawing-with-svgs-arc-path
  const {x, y} = origin;
  const s = sweep ? `1` :`0`;
  return `
    M ${x}, ${y}
    m -${radius}, 0
    a ${radius},${radius} 0 1,${s} ${radius*2},0
    a ${radius},${radius} 0 1,${s} -${radius*2},0
  `.split(`\n`);
};

/**
 * Returns a `CircularPath` representation of a circle
 *
 * @param {CirclePositioned} circle
 * @returns {CircularPath}
 */
export const toPath = (circle:CirclePositioned): CircularPath => {
  guard(circle);

  return Object.freeze({
    ...circle,
    /**
     * Returns a relative (0.0-1.0) point on a circle. 0=3 o'clock, 0.25=6 o'clock, 0.5=9 o'clock, 0.75=12 o'clock etc.
     * @param {t} Relative (0.0-1.0) point
     * @returns {Point} X,y
     */
    interpolate: (t:number) => interpolate(circle, t),
    bbox:() => bbox(circle) as Rects.RectPositioned,
    length: () => length(circle),
    toSvgString: (sweep = true) => toSvg(circle, sweep),
    kind: `circular`
  });
};

/**
 * Returns the point(s) of intersection between a circle and line.
 * @param circle 
 * @param line 
 * @returns Point(s) of intersection, or empty array
 */
export const intersectionLine = (circle:CirclePositioned, line:Line): readonly Points.Point[] => {
  const v1 = {
    x: line.b.x - line.a.x,
    y: line.b.y - line.a.y
  };
  const v2 = {
    x: line.a.x - circle.x,
    y: line.a.y - circle.y
  };

  const b = (v1.x * v2.x + v1.y * v2.y) * -2;
  const c = 2 * (v1.x * v1.x + v1.y * v1.y);
  
  const d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.radius * circle.radius));
  if(isNaN(d)) return []; // no intercept

  const u1 = (b - d) / c;  // these represent the unit distance of point one and two on the line
  const u2 = (b + d) / c;    

  const ret = [];
  if(u1 <= 1 && u1 >= 0) {  // add point if on the line segment
    //eslint-disable-next-line functional/immutable-data
    ret.push({ 
      x: line.a.x + v1.x * u1,
      y: line.a.y + v1.y * u1
    });
  }
  if(u2 <= 1 && u2 >= 0) {  // second add point if on the line segment
    //eslint-disable-next-line functional/immutable-data
    ret.push({
      x: line.a.x + v1.x * u2,
      y: line.a.y + v1.y * u2
    });
  }       
  return ret;
};