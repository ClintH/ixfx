import * as Arcs from './Arc.js';
import * as Beziers from './Bezier.js';
import * as Circles from './Circle.js';
import * as Compound from './CompoundPath.js';
import * as Grids from './Grid.js';
import * as Lines from './Line.js';
import * as Paths from './Path.js';
import * as Points from './Point.js';
import * as Rects from './Rect.js';
import * as Ellipses from './Ellipse.js';

export {Circles, Arcs, Lines, Rects, Points, Paths, Grids, Beziers, Compound, Ellipses};

export * as Polar from './Polar.js';

export * as Shapes from './Shape.js';

/**
 * Triangle processing.
 * 
 * Helpers for creating:
 * - {@link Triangles.fromFlatArray}: Create from [x1, y1, x2, y2, x3, y3]
 * - {@link Triangles.fromPoints}: Create from three {x,y} sets
 * - {@link Triangles.fromRadius}: Equilateral triangle of a given radius and center
 */
export * as Triangles from './Triangle.js';
 
/**
 * Convert angle in degrees to angle in radians.
 * @param angleInDegrees 
 * @returns 
 */
export function degreeToRadian(angleInDegrees:number):number;

/**
 * Convert angles in degrees to angles in radians
 * @param angleInDegrees 
 */
export function degreeToRadian(angleInDegrees:readonly number[]):readonly number[];

export function degreeToRadian(angleInDegrees:number|readonly number[]):number|readonly number[] {
  if (Array.isArray(angleInDegrees)) {
    return angleInDegrees.map(v => v * (Math.PI / 180.0));
  } else {
    return (angleInDegrees as number) * (Math.PI / 180.0);
  }
}

/**
 * Convert angle in radians to angle in degrees
 * @param angleInRadians
 * @returns 
 */
export function radianToDegree(angleInRadians:number):number;

/**
 * Convert angles in radians to angles in degrees
 * @param angleInRadians 
 */
export function radianToDegree(angleInRadians:readonly number[]):readonly number[];

//eslint-disable-next-line func-style
export function radianToDegree(angleInRadians:number|readonly number[]):number| readonly number[] {
  if (Array.isArray(angleInRadians)) {
    return angleInRadians.map(v => v * 180 / Math.PI);
  } else {
    return (angleInRadians as number) * 180 / Math.PI;
  }
}

/**
 * Angle from x-axis to point (ie. `Math.atan2`)
 * @param point 
 * @returns 
 */
export const radiansFromAxisX = (point:Points.Point):number => Math.atan2(point.x, point.y);
