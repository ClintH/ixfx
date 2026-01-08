import type { Point } from "../point/point-type.js"

/**
 * Converts to Cartesian coordiantes
 */
export type PolarToCartesian = {
  (point: Coord, origin?: Point): Point;
  (distance: number, angleRadians: number, origin?: Point): Point;
};

/**
 * A polar ray allows you to express a line in polar coordinates
 * rather than two x,y points.  
 * 
 * It consists of an angle (in radians) with a given offset and length.
 * This way of defining a line makes some manipulations really easy, for example, to
 * make a set of lines that radiate out from a point in a circular direction, and then animate
 * them inwards and outwards.
 * 
 * An alternative is  {@link PolarLine} which defines a line as two {@link Coord}s with a common origin.
 * 
 * Properties
 * * angleRadian: Angle of line
 * * offset: distance from the polar origin (default: 0)
 * * length: length of ray
 * * origin: Start Cartesian coordinate of line
 */
export type PolarRay = Readonly<{
  /**
   * Angle of ray in radian
   */
  angleRadian: number
  /**
   * Starting point of a ray, defined as an
   * offset from the polar origin.
   */
  offset?: number
  /**
   * Length of ray
   */
  length: number
  /**
   * Optional origin point of ray (ie. start)
   */
  origin?: Point
}>

export type PolarRayWithOrigin = PolarRay & Readonly<{
  origin: Point
}>

/**
 * Expresses a line as two angles and offset from a
 * common origin.
 * 
 * Alternatives:
 * * {@link PolarRay}: Defines a line along a single ray
 * * {@link Line}: Defines a line by two Cartesian (x,y) pairs
 */
export type PolarLine = Readonly<{
  a: Coord,
  b: Coord
}>

/**
 * Polar coordinate, made up of a distance and angle in radians.
 * Most computations involving PolarCoord require an `origin` as well.
 */
export type Coord = Readonly<{
  distance: number;
  angleRadian: number;
}>;