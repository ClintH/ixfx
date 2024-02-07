import type { Point, Point3d } from "./point/index.js";


export type Sphere = Point3d & {
  readonly radius: number;
};


/**
 * Polar coordinate, made up of a distance and angle in radians.
 * Most computations involving PolarCoord require an `origin` as well.
 */
export type PolarCoord = {
  readonly distance: number;
  readonly angleRadian: number;
};

export type Vector = Point | PolarCoord;
export type { Circle, CirclePositioned, CircularPath } from "./circle/index.js";
export { type Line, type PolyLine } from "./line/index.js";
export { type Point, type Point3d } from "./point/index.js";
export type * from './rect/index.js';
export type * from './path/index.js';
export type { PointCalculableShape, ShapePositioned } from './shape/index.js';

export type { Triangle } from './triangle/index.js'
