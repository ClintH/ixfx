
import type { Point } from './point/PointType.js';
import { degreeToRadian } from './Angles.js';
import type { Path } from './path/index.js';

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


export const fromDegrees = (radiusX: number, radiusY: number, rotationDeg = 0, startAngleDeg = 0, endAngleDeg = 360): Ellipse => ({
  radiusX, radiusY,
  rotation: degreeToRadian(rotationDeg),
  startAngle: degreeToRadian(startAngleDeg),
  endAngle: degreeToRadian(endAngleDeg)
});

export type EllipticalPath = Ellipse & Path & {
  readonly kind: `elliptical`
};