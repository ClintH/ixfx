import * as Points from './Point.js';
import {guard as guardPoint} from './Point.js';
import * as MathUtil from './Math.js';
import {Path} from './Path.js';
import * as Rects from './Rect.js';
import {Lines} from '../index.js';

const isArc = (p: Circle | Arc): p is Arc => (p as Arc).startRadian !== undefined && (p as Arc).endRadian !== undefined;

const isCircle = (p: Circle | Points.Point): p is Circle => (p as Circle).radius !== undefined;
//const isCirclePositioned = (p: Circle | Points.Point): p is CirclePositioned => (p as CirclePositioned).radius !== undefined && (p as CirclePositioned).x !== undefined && (p as CirclePositioned).y !== undefined;
export const isPositioned = (p: Circle | Points.Point | Arc| ArcPositioned): p is Points.Point => (p as Points.Point).x !== undefined && (p as Points.Point).y !== undefined;

export type Circle = {
  readonly radius: number
}

export type CirclePositioned = Points.Point & Circle;
export type CircularPath = Circle & Path & {
  kind: `circular`
};


export type Arc = {
  readonly radius:number
  readonly startRadian:number
  readonly endRadian:number
  readonly counterClockwise?:boolean
}


export type ArcPositioned = Points.Point & Arc;

const PIPI = Math.PI *2;

export const arcFrom = (radius:number, startDegrees:number, endDegrees:number, origin?:Points.Point): Arc|ArcPositioned => {
  const a = {
    radius,
    startRadian:MathUtil.degreeToRadian(startDegrees),
    endRadian:MathUtil.degreeToRadian(endDegrees)
  };
  if (origin !== undefined) {
    guardPoint(origin);
    return Object.freeze({
      ...a,
      x: origin.x,
      y: origin.y
    });
  } else return Object.freeze(a);
};

/**
 * Returns a point on a circle at a specified angle in radians
 * @param {(Circle|CirclePositioned)} circle
 * @param {number} angleRadian Angle in radians
 * @param {Point} [origin] Origin or offset of calculated point. By default uses center of circle or 0,0 if undefined
 * @returns {Point}
 */
export const pointOnCircle = (circle:Circle|CirclePositioned, angleRadian:number, origin?:Points.Point): Points.Point => {
  if (origin === undefined) {
    if (isPositioned(circle)) {
      origin = circle;
    } else {
      origin = {x:0, y:0};
    }
  }
  return {
    x: (Math.cos(angleRadian) * circle.radius) + origin.x,
    y: (Math.sin(angleRadian) * circle.radius) + origin.y
  };
};
/**
 * Returns a Line from start to end point of arc
 *
 * @param {ArcPositioned} arc
 * @returns {Lines.Line}
 */
export const toLine = (arc:ArcPositioned):Lines.Line => Lines.fromPoints(
  pointOnArc(arc, arc.startRadian),
  pointOnArc(arc, arc.endRadian)
);

export const pointOnArc = (arc:Arc|ArcPositioned, angleRadian:number, origin?:Points.Point): Points.Point => {
  if (angleRadian > arc.endRadian) throw new Error(`angleRadian beyond end angle of arc`);
  if (angleRadian < arc.startRadian) throw new Error(`angleRadian beyond start angle of arc`);

  if (origin === undefined) {
    if (isPositioned(arc)) {
      origin = arc;
    } else {
      origin = {x:0, y:0};
    }
  }
  return {
    x: (Math.cos(angleRadian) * arc.radius) + origin.x,
    y: (Math.sin(angleRadian) * arc.radius) + origin.y
  };
};


const guard = (circleOrArc:CirclePositioned|Circle|Arc|ArcPositioned) => {
  if (isPositioned(circleOrArc)) {
    guardPoint(circleOrArc, `circleOrArc`);
  }

  if (Number.isNaN(circleOrArc.radius)) throw new Error(`Radius is NaN`);
  if (circleOrArc.radius <= 0) throw new Error(`Radius must be greater than zero`);

  if (isArc(circleOrArc)) {
    if(circleOrArc.startRadian >= circleOrArc.endRadian) throw new Error(`startRadian is expected to be les than endRadian`);  
  }
};

/**
 * Returns a `CircularPath` representation of a circle
 *
 * @param {CirclePositioned} circle
 * @returns {CircularPath}
 */
export const circleToPath = (circle:CirclePositioned): CircularPath => {
  guard(circle);

  return {
    ...circle,
    /**
     * Returns a relative (0.0-1.0) point on a circle. 0=3 o'clock, 0.25=6 o'clock, 0.5=9 o'clock, 0.75=12 o'clock etc.
     * @param {t} Relative (0.0-1.0) point
     * @returns {Point} X,y
     */
    compute: (t:number) => compute(circle, t),
    bbox:() => bbox(circle),
    length: () => 0,
    toSvgString: () => `blerg`,
    kind: `circular`
  };
};

export const compute = (circleOrArc:ArcPositioned|CirclePositioned, t:number):Points.Point => {
  if (isArc(circleOrArc)) {
    return pointOnArc(circleOrArc, circleOrArc.startRadian + ((circleOrArc.endRadian-circleOrArc.startRadian)*t));
  } else if (isCircle(circleOrArc)) {
    return pointOnCircle(circleOrArc, t*PIPI);
  } else throw new Error(`Parameter invalid`);
};
export const arcToPath = (arc:ArcPositioned): Path => {
  guard(arc);

  return {
    ...arc,
    compute:(t:number) => compute(arc, t),
    bbox:() => bbox(arc),
    length: () => 0,
    toSvgString:() => `blerg`,
    kind: `arc`
  };

};

export const bbox = (circleOrArc:CirclePositioned|ArcPositioned):Rects.Rect => {
  if (isArc(circleOrArc)) {
    const middle = compute(circleOrArc, 0.5);
    const asLine = toLine(circleOrArc);
    const leftMost = Points.compareTo((a, b) => {
      if (a.x < b.x) return a;
      else return b;
    }, middle, asLine.a, asLine.b);
    return Rects.fromCenter(circleOrArc,  circleOrArc.radius*2, circleOrArc.radius*2);
  } else if (isCircle(circleOrArc)) {
    return Rects.fromCenter(circleOrArc, circleOrArc.radius*2, circleOrArc.radius*2);
  } else {
    throw new Error(`Invalid parameter`);
  }
};

export const arcToSvg = (origin:Points.Point, radius:number, startAngle:number, endAngle:number) => {
  const fullCircle = endAngle - startAngle === 360;
  const start = MathUtil.polarToCartesian(origin, radius, endAngle - 0.01);
  const end = MathUtil.polarToCartesian(origin, radius, startAngle);
  const arcSweep = endAngle - startAngle <= 180 ? `0` : `1`;

  const d = [
    `M`, start.x, start.y,
    `A`, radius, radius, 0, arcSweep, 0, end.x, end.y,
  ];

  if (fullCircle) d.push(`z`);
  return d.join(` `);
};

export const distanceCenter = (a:CirclePositioned, b:CirclePositioned):number => Points.distance(a, b);

/**
 * Returns true if the two objects have the same values
 *
 * @param {CirclePositioned} a
 * @param {CirclePositioned} b
 * @returns {boolean}
 */
export const isEquals = (a:CirclePositioned|Circle, b:CirclePositioned|Circle):boolean => {
  if (a.radius !== b.radius) return false;

  if (isPositioned(a) && isPositioned(b)) {
    if (a.x !== b.x) return false;
    if (a.y !== b.y) return false;
    if (a.z !== b.z) return false;
    return true;
  }
  return false;
};

/**
 * Returns true if `b` is contained by `a`
 *
 * @param {CirclePositioned} a
 * @param {CirclePositioned} b
 * @returns {boolean}
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
 * @param {CirclePositioned} a
 * @param {CirclePositioned} b
 * @returns {boolean}
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
 * @param {CirclePositioned} a Circle
 * @param {CirclePositioned} b Circle
 * @returns {Points.Point[]} Points of intersection, or an empty list if there are none
 */
export const intersections = (a:CirclePositioned, b:CirclePositioned):Points.Point[] => {
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