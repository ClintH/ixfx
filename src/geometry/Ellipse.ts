import { type Path } from './Path.js';
import type { Point } from './points/Types.js';
import { degreeToRadian } from './index.js';

/**
 * An ellipse
 */
export type Ellipse = {
  readonly radiusX: number
  readonly radiusY: number
  /**
   * Rotation, in radians
   */
  readonly rotation?: number
  readonly startAngle?: number
  readonly endAngle?: number
}

/**
 * A {@link Ellipse} with position
 */
export type EllipsePositioned = Point & Ellipse


export const fromDegrees = (radiusX: number, radiusY: number, rotationDeg: number = 0, startAngleDeg: number = 0, endAngleDeg: number = 360): Ellipse => ({
  radiusX, radiusY,
  rotation: degreeToRadian(rotationDeg),
  startAngle: degreeToRadian(startAngleDeg),
  endAngle: degreeToRadian(endAngleDeg)
});

export type EllipticalPath = Ellipse & Path & {
  readonly kind: `elliptical`
};