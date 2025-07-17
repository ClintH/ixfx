import type { Point } from "../point/point-type.js"

/**
 * Converts to Cartesian coordiantes
 */
export type PolarToCartesian = {
  (point: Coord, origin?: Point): Point;
  (distance: number, angleRadians: number, origin?: Point): Point;
};

/**
 * A polar ray is a line in polar coordinates
 * It consists of an angle (in radians) with a given offset and length.
 */
export type PolarRay = Readonly<{
  /**
   * Angle of ray
   */
  angleRadian: number
  /**
   * Starting point of a ray, defined as an
   * offset from the polar origin.
   */
  offset: number
  /**
   * Length of ray
   */
  length: number
  origin?: Point
}>

export type PolarRayWithOrigin = PolarRay & Readonly<{
  origin: Point
}>

/**
 * Polar coordinate, made up of a distance and angle in radians.
 * Most computations involving PolarCoord require an `origin` as well.
 */
export type Coord = {
  readonly distance: number;
  readonly angleRadian: number;
};