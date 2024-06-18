import { Points, Polar } from '../index.js';
import { Arrays } from '../../collections/index.js';
import { defaultRandom, type RandomSource } from '../../random/Types.js';
import { guard, isCircle, isCirclePositioned } from './Guard.js';
import { fromCenter as RectsFromCenter } from '../rect/FromCenter.js';
import type { Point } from '../point/PointType.js';
import type { RectPositioned } from '../rect/index.js';
import type { Line } from '../line/LineType.js';
import type { Circle, CirclePositioned } from './CircleType.js';
import type { CircularPath } from './CircularPath.js';

const piPi = Math.PI * 2;
export type * from './CircleType.js';
export * from './CircularPath.js';
export * from './DistanceCenter.js';
export * from './DistanceFromExterior.js';
export * from './ExteriorPoints.js';
export * from './Guard.js';
export * from './InteriorPoints.js';
export * from './Intersecting.js';
export * from './Intersections.js';
export * from './IsContainedBy.js';
export * from './IsEqual.js';
export * from './ToPositioned.js';

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
export const point = (circle: Circle | CirclePositioned, angleRadian: number, origin?: Point): Point => {
  if (origin === undefined) {
    origin = isCirclePositioned(circle) ? circle : { x: 0, y: 0 };
  }
  return {
    x: (Math.cos(-angleRadian) * circle.radius) + origin.x,
    y: (Math.sin(-angleRadian) * circle.radius) + origin.y
  };
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
export const center = (circle: CirclePositioned | Circle) => {
  return isCirclePositioned(circle) ? Object.freeze({ x: circle.x, y: circle.y }) : Object.freeze({ x: circle.radius, y: circle.radius });
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
export const interpolate = (circle: CirclePositioned, t: number): Point => point(circle, t * piPi);

/**
 * Returns circumference of `circle` (alias of {@link circumference})
 * @param circle 
 * @returns 
 */
export const length = (circle: Circle): number => circumference(circle);

/**
 * Returns circumference of `circle` (alias of {@link length})
 * @param circle 
 * @returns 
 */
export const circumference = (circle: Circle): number => {
  guard(circle);
  return piPi * circle.radius;
};



/**
 * Returns the area of `circle`.
 * @param circle 
 * @returns 
 */
export const area = (circle: Circle) => {
  guard(circle);
  return Math.PI * circle.radius * circle.radius;
};

/**
 * Computes a bounding box that encloses circle
 * @param circle
 * @returns 
 */
export const bbox = (circle: CirclePositioned | Circle): RectPositioned => {
  return isCirclePositioned(circle) ?
    RectsFromCenter(circle, circle.radius * 2, circle.radius * 2) :
    { width: circle.radius * 2, height: circle.radius * 2, x: 0, y: 0 };
};



export type RandomPointOpts = {
  /**
   * Algorithm to calculate random values.
   * Default: 'uniform'
   */
  readonly strategy: `naive` | `uniform`
  /**
   * Random number source.
   * Default: Math.random
   */
  readonly randomSource: RandomSource
  /**
   * Margin within shape to start generating random points
   * Default: 0
   */
  readonly margin: number
}

/**
 * Returns a random point within a circle.
 * 
 * By default creates a uniform distribution.
 * 
 * ```js
 * const pt = randomPoint({radius: 5});
 * const pt = randomPoint({radius: 5, x: 10, y: 20});
 * ```'
 * 
 * Generate points with a gaussian distribution
 * ```js
 * const pt = randomPoint(circle, {
 *  randomSource: Random.gaussian
 * })
 * ```
 * @param within Circle to generate a point within
 * @param opts Options
 * @returns 
 */
export const randomPoint = (within: Circle | CirclePositioned, opts: Partial<RandomPointOpts> = {}): Point => {
  const offset: Point = isCirclePositioned(within) ? within : { x: 0, y: 0 };
  const strategy = opts.strategy ?? `uniform`;
  const margin = opts.margin ?? 0;
  const radius = within.radius - margin;
  const rand = opts.randomSource ?? defaultRandom;
  switch (strategy) {
    case `naive`: {
      return Points.sum(offset, Polar.toCartesian(rand() * radius, rand() * piPi));
    }
    case `uniform`: {
      return Points.sum(offset, Polar.toCartesian(Math.sqrt(rand()) * radius, rand() * piPi));
    }
    default: {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Unknown strategy '${ strategy }'. Expects 'uniform' or 'naive'`);
    }
  }
};

export function multiplyScalar(a: CirclePositioned, value: number): CirclePositioned;

export function multiplyScalar(a: Circle, value: number): Circle;

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
export function multiplyScalar(a: Circle | CirclePositioned, value: number): Circle | CirclePositioned {
  if (isCirclePositioned(a)) {
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


type ToSvg = {
  (circleOrRadius: Circle | number, sweep: boolean, origin: Point): ReadonlyArray<string>;
  (circle: CirclePositioned, sweep: boolean): ReadonlyArray<string>;
};


/**
 * Creates a SVG path segment.
 * @param a Circle or radius
 * @param sweep If true, path is 'outward'
 * @param origin Origin of path. Required if first parameter is just a radius or circle is non-positioned
 * @returns 
 */
export const toSvg: ToSvg = (a: CirclePositioned | number | Circle, sweep: boolean, origin?: Point): ReadonlyArray<string> => {
  if (isCircle(a)) {
    if (origin !== undefined) {
      return toSvgFull(a.radius, origin, sweep);
    }
    if (isCirclePositioned(a)) {
      return toSvgFull(a.radius, a, sweep);
    } else throw new Error(`origin parameter needed for non-positioned circle`);
  } else {
    if (origin === undefined) { throw new Error(`origin parameter needed`); } else {
      return toSvgFull(a, origin, sweep);
    }
  }
};

const toSvgFull = (radius: number, origin: Point, sweep: boolean): ReadonlyArray<string> => {
  // https://stackoverflow.com/questions/5737975/circle-drawing-with-svgs-arc-path
  const { x, y } = origin;
  const s = sweep ? `1` : `0`;
  return `
    M ${ x }, ${ y }
    m -${ radius }, 0
    a ${ radius },${ radius } 0 1,${ s } ${ radius * 2 },0
    a ${ radius },${ radius } 0 1,${ s } -${ radius * 2 },0
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
export const nearest = (circle: CirclePositioned | ReadonlyArray<CirclePositioned>, b: Point): Point => {
  const n = (a: CirclePositioned): Point => {
    const l = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
    const x = a.x + (a.radius * ((b.x - a.x) / l));
    const y = a.y + (a.radius * ((b.y - a.y) / l));
    return { x, y };
  };

  if (Array.isArray(circle)) {
    const pts = circle.map(l => n(l));
    const dists = pts.map(p => Points.distance(p, b));
    return Object.freeze<Point>(pts[ Arrays.minIndex(...dists) ]);
  } else {
    return Object.freeze<Point>(n(circle as CirclePositioned));
  }
};

/**
 * Returns a `CircularPath` representation of a circle
 *
 * @param {CirclePositioned} circle
 * @returns {CircularPath}
 */
export const toPath = (circle: CirclePositioned): CircularPath => {
  guard(circle);

  return {
    ...circle,
    nearest: (point: Point) => nearest(circle, point),
    /**
     * Returns a relative (0.0-1.0) point on a circle. 0=3 o'clock, 0.25=6 o'clock, 0.5=9 o'clock, 0.75=12 o'clock etc.
     * @param {t} Relative (0.0-1.0) point
     * @returns {Point} X,y
     */
    interpolate: (t: number) => interpolate(circle, t),
    bbox: () => bbox(circle),
    length: () => length(circle),
    toSvgString: (sweep = true) => toSvg(circle, sweep),
    relativePosition: (_point: Point, _intersectionThreshold: number) => {
      throw new Error(`Not implemented`)
    },
    distanceToPoint: (_point: Point): number => {
      throw new Error(`Not implemented`)
    },
    kind: `circular`
  };
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
export const intersectionLine = (circle: CirclePositioned, line: Line): ReadonlyArray<Point> => {
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

  const returnValue = [];
  if (u1 <= 1 && u1 >= 0) {  // add point if on the line segment
    //eslint-disable-next-line functional/immutable-data
    returnValue.push({
      x: line.a.x + v1.x * u1,
      y: line.a.y + v1.y * u1
    });
  }
  if (u2 <= 1 && u2 >= 0) {  // second add point if on the line segment
    //eslint-disable-next-line functional/immutable-data
    returnValue.push({
      x: line.a.x + v1.x * u2,
      y: line.a.y + v1.y * u2
    });
  }
  return returnValue;
};

