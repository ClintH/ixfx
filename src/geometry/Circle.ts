import { guard as guardPoint } from './Point.js';
import { Path } from './Path.js';
import { Line } from './Line.js';
import { Points, Rects } from  './index.js';
import { Arrays } from '../collections/index.js';
const piPi = Math.PI *2;

/**
 * A circle
 */
export type Circle = {
  readonly radius:number
}

/**
 * A {@link Circle} with position
 */
export type CirclePositioned = Points.Point & Circle;

export type CircularPath = Circle & Path & {
  readonly kind:`circular`
};

/**
 * Returns true if parameter has x,y. Does not verify if parameter is a circle or not
 * 
 * ```js
 * import { Circles } from "https://unpkg.com/ixfx/dist/geometry.js" 
 * 
 * const circleA = { radius: 5 };
 * Circles.isPositioned(circle); // false
 * 
 * const circleB = { radius: 5, x: 10, y: 10 }
 * Circles.isPositioned(circle); // true
 * ```
 * @param p Circle
 * @returns 
 */
export const isPositioned = (p:Circle | Points.Point):p is Points.Point => (p as Points.Point).x !== undefined && (p as Points.Point).y !== undefined;
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isCircle = (p:Circle|CirclePositioned|any):p is Circle => (p as Circle).radius !== undefined;
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isCirclePositioned = (p:Circle|CirclePositioned|any):p is CirclePositioned => isCircle(p) && isPositioned(p);

/**
 * Returns a point on a circle at a specified angle in radians
 * 
 * ```js
 * import { Circles } from "https://unpkg.com/ixfx/dist/geometry.js" 
 * 
 * // Circle without position
 * const circleA = { radius: 5 };
 * 
 * // Get point at angle Math.PI, passing in a origin coordinate
 * const ptA = Circles.point(circleA, Math.PI, {x: 10, y: 10 });
 * 
 * // Point on circle with position
 * const circleB = { radius: 5, x: 10, y: 10};
 * const ptB = Circles.point(circleB, Math.PI);
 * ```
 * @param circle
 * @param angleRadian Angle in radians
 * @param Origin or offset of calculated point. By default uses center of circle or 0,0 if undefined
 * @returns Point oo circle
 */
export const point = (circle:Circle|CirclePositioned, angleRadian:number, origin?:Points.Point):Points.Point => {
  if (origin === undefined) {
    if (isPositioned(circle)) {
      origin = circle;
    } else {
      origin = { x:0, y:0 };
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
 * Returns the center of a circle
 * 
 * If the circle has an x,y, that is the center.
 * If not, `radius` is used as the x and y.
 * 
 * ```js
 * import { Circles } from "https://unpkg.com/ixfx/dist/geometry.js" 
 * const circle = { radius: 5, x: 10, y: 10};
 * 
 * // Yields: { x: 5, y: 10 }
 * Circles.center(circle);
 * ```
 * 
 * It's a trivial function, but can make for more understandable code
 * @param circle 
 * @returns Center of circle
 */
export const center = (circle:CirclePositioned|Circle) => {
  if (isPositioned(circle)) return Object.freeze({ x: circle.x, y: circle.y });
  else return Object.freeze({ x: circle.radius, y: circle.radius });
};
/**
 * Computes relative position along circle
 * 
 * ```js
 * import { Circles } from "https://unpkg.com/ixfx/dist/geometry.js" 
 * const circle = { radius: 100, x: 100, y: 100 };
 * 
 * // Get a point halfway around circle
 * // Yields { x, y }
 * const pt = Circles.interpolate(circle, 0.5);
 * ```
 * @param circle 
 * @param t Position, 0-1
 * @returns 
 */
export const interpolate = (circle:CirclePositioned, t:number):Points.Point => point(circle, t*piPi);

/**
 * Returns circumference of `circle` (alias of {@link circumference})
 * @param circle 
 * @returns 
 */
export const length = (circle:Circle):number => circumference(circle);

/**
 * Returns circumference of `circle` (alias of {@link length})
 * @param circle 
 * @returns 
 */
export const circumference = (circle:Circle):number => {
  guard(circle);
  return piPi*circle.radius;
};

/**
 * Returns the area of `circle`.
 * @param circle 
 * @returns 
 */
export const area = (circle:Circle) => {
  guard(circle);
  return Math.PI * circle.radius * circle.radius;
};

/**
 * Computes a bounding box that encloses circle
 * @param circle
 * @returns 
 */
export const bbox = (circle:CirclePositioned|Circle):Rects.RectPositioned|Rects.Rect => {
  if (isPositioned(circle)) {
    return Rects.fromCenter(circle, circle.radius*2, circle.radius*2);
  } else {
    return { width: circle.radius*2, height: circle.radius*2 };
  }
};

/**
 * Returns true if `b` is completely contained by `a`
 *
 * @param a Circle
 * @param b Circle or point to compare to
 * @returns
 */
export const isContainedBy = (a:CirclePositioned, b:CirclePositioned|Points.Point):boolean => {
  const d = distanceCenter(a, b);
  if (isCircle(b)) {
    return (d < Math.abs(a.radius - b.radius));
  } else {
    return d <= a.radius;
  }
};

/***
 * Returns true if radius, x or y are NaN
 */
export const isNaN = (a:Circle|CirclePositioned):boolean => {
  if (Number.isNaN(a.radius)) return true;
  if (isPositioned(a)) {
    if (Number.isNaN(a.x)) return true;
    if (Number.isNaN(a.y)) return true;
  }
  return false;
};
/**
 * Returns true if a or b overlap or are equal
 * 
 * Use `intersections` to find the points of intersection
 *
 * @param a Circle
 * @param b Circle or point to test
 * @returns True if circle overlap
 */
export const isIntersecting = (a:CirclePositioned, b:CirclePositioned|Points.Point):boolean => {
  if (Points.isEqual(a, b)) return true;
  if (isContainedBy(a, b)) return true;
  if (isCircle(b)) {
    return intersections(a, b).length === 2;
  } 
  return false;
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
  if (isEqual(a, b)) return [];

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
 * ```js
 * const circleA = { radius: 10, x: 5, y: 5 };
 * const circleB = { radius: 10, x: 5, y: 5 };
 * 
 * circleA === circleB; // false, because identity of objects is different
 * Circles.isEqual(circleA, circleB); // true, because values are the same
 * ```
 * 
 * Circles must both be positioned or not.
 * @param a
 * @param b
 * @returns
 */
export const isEqual = (a:CirclePositioned|Circle, b:CirclePositioned|Circle):boolean => {
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


export function multiplyScalar(a:CirclePositioned, value:number):CirclePositioned;

export function multiplyScalar(a:Circle, value:number):Circle;

/**
 * Multiplies a circle's radius and position (if provided) by `value`.
 * 
 * ```js
 * multiplyScalar({ radius: 5 }, 5);
 * // Yields: { radius: 25 }
 * 
 * multiplyScalar({ radius: 5, x: 10, y: 20 }, 5);
 * // Yields: { radius: 25, x: 50, y: 100 }
 * ```
 */
export function multiplyScalar(a:Circle|CirclePositioned, value:number):Circle|CirclePositioned {
  if (isPositioned(a)) {
    const pt = Points.multiplyScalar(a, value);
    return Object.freeze({
      ...a,
      ...pt,
      radius: a.radius * value
    });
  } else {
    return Object.freeze({
      ...a,
      radius: a.radius * value
    });
  }
}


/**
 * Returns the distance between two circle centers.
 * 
 * ```js
 * import { Circles } from "https://unpkg.com/ixfx/dist/geometry.js" 
 * const circleA = { radius: 5, x: 5, y: 5 }
 * const circleB = { radius: 10, x: 20, y: 20 }
 * const distance = Circles.distanceCenter(circleA, circleB);
 * ```
 * Throws an error if either is lacking position.
 * @param a 
 * @param b 
 * @returns Distance
 */
export const distanceCenter = (a:CirclePositioned, b:CirclePositioned|Points.Point):number => {
  guardPositioned(a, `a`);
  if (isCirclePositioned(b)) {
    guardPositioned(b, `b`);
  }
  return Points.distance(a, b);
};

/**
 * Returns the distance between the exterior of two circles, or between the exterior of a circle and point.
 * If `b` overlaps or is enclosed by `a`, distance is 0.
 * 
 * ```js
 * import { Circles } from "https://unpkg.com/ixfx/dist/geometry.js" 
 * const circleA = { radius: 5, x: 5, y: 5 }
 * const circleB = { radius: 10, x: 20, y: 20 }
 * const distance = Circles.distanceCenter(circleA, circleB);
 * ```
 * @param a
 * @param b 
 */
export const distanceFromExterior = (a:CirclePositioned, b:CirclePositioned|Points.Point):number => {
  guardPositioned(a, `a`);
  if (isCirclePositioned(b)) {
    return Math.max(0, distanceCenter(a, b) - a.radius - b.radius);
  } else if (Points.isPoint(b)) {
    const dist =  Points.distance(a, b);
    if (dist < a.radius) return 0;
    return dist;
  } else throw new Error(`Second parameter invalid type`);
};

type ToSvg = {
  (radius:number, sweep:boolean, origin:Points.Point):readonly string[];
  (circle:Circle, sweep:boolean, origin:Points.Point):readonly string[];
  (circle:CirclePositioned, sweep:boolean):readonly string[];
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
  const { x, y } = origin;
  const s = sweep ? `1` :`0`;
  return `
    M ${x}, ${y}
    m -${radius}, 0
    a ${radius},${radius} 0 1,${s} ${radius*2},0
    a ${radius},${radius} 0 1,${s} -${radius*2},0
  `.split(`\n`);
};

/**
 * Returns the nearest point on `circle` closest to `point`.
 * 
 * ```js
 * import { Circles } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const pt = Circles.nearest(circle, {x:10,y:10});
 * ```
 * 
 * If an array of circles is provided, it will be the closest point amongst all the circles
 * @param circle Circle or array of circles
 * @param point
 * @returns Point `{ x, y }`
 */
export const nearest = (circle:CirclePositioned|readonly CirclePositioned[], b:Points.Point):Points.Point => {
  const n = (a:CirclePositioned):Points.Point => {
    const l = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y-a.y, 2));
    const x = a.x + (a.radius * ((b.x - a.x) / l));
    const y = a.y + (a.radius * ((b.y - a.y) / l));
    return { x, y };
  };

  if (Array.isArray(circle)) {
    const pts = circle.map(l => n(l));
    const dists = pts.map(p => Points.distance(p, b));
    return Object.freeze<Points.Point>(pts[Arrays.minIndex(...dists)]);
  } else {
    return Object.freeze<Points.Point>(n(circle as CirclePositioned));
  }
};

/**
 * Returns a positioned version of a circle.
 * If circle is already positioned, it is returned.
 * If no default position is supplied, 0,0 is used.
 * @param circle 
 * @param defaultPositionOrX 
 * @param y 
 * @returns 
 */
export const toPositioned = (circle:Circle|CirclePositioned, defaultPositionOrX?:Points.Point|number, y?:number):CirclePositioned => {
  if (isPositioned(circle)) return circle;

  // Returns 0,0 if params are undefined
  const pt = Points.getPointParam(defaultPositionOrX, y);
  return Object.freeze({
    ...circle,
    ...pt
  });
};
/**
 * Returns a `CircularPath` representation of a circle
 *
 * @param {CirclePositioned} circle
 * @returns {CircularPath}
 */
export const toPath = (circle:CirclePositioned):CircularPath => {
  guard(circle);

  return Object.freeze({
    ...circle,
    nearest: (point:Points.Point) => nearest(circle, point),
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
 * 
 * ```js
 * import { Circles } from "https://unpkg.com/ixfx/dist/geometry.js" 
 * const circle = { radius: 5, x: 5, y: 5 };
 * const line = { a: { x: 0, y: 0 }, b: { x: 10, y: 10 } };
 * const pts = Circles.intersectionLine(circle, line);
 * ```
 * @param circle 
 * @param line 
 * @returns Point(s) of intersection, or empty array
 */
export const intersectionLine = (circle:CirclePositioned, line:Line):readonly Points.Point[] => {
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
  if (Number.isNaN(d)) return []; // no intercept

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