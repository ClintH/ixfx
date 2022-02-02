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
 * Returns true if parameter has x,y
 * @param p Circle or point
 * @returns 
 */
export const isPositioned = (p: Circle | Points.Point): p is Points.Point => (p as Points.Point).x !== undefined && (p as Points.Point).y !== undefined;

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

const guard = (circle:CirclePositioned|Circle) => {
  if (isPositioned(circle)) {
    guardPoint(circle, `circle`);
  }

  if (Number.isNaN(circle.radius)) throw new Error(`Radius is NaN`);
  if (circle.radius <= 0) throw new Error(`Radius must be greater than zero`);
};


/**
 * Computes relative position along circle
 * @param circle 
 * @param t Position, 0-1
 * @returns 
 */
export const compute = (circle:CirclePositioned, t:number):Points.Point => point(circle, t*piPi);

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
  const vector = Points.diff(b, a);
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
    Points.diff(centroid, intersection)
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
 * Returns the distance between two circle centers
 * @param a 
 * @param b 
 * @returns 
 */
export const distanceCenter = (a:CirclePositioned, b:CirclePositioned):number => Points.distance(a, b);

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
    compute: (t:number) => compute(circle, t),
    bbox:() => bbox(circle) as Rects.RectPositioned,
    length: () => length(circle),
    toSvgString: () => ``,
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