import type { Point, Point3d } from './point/point-type.js';
import type { Circle, CirclePositioned } from './circle/circle-type.js';
import type { Sphere } from './shape/index.js';

import { toPositioned as circleToPositioned } from './circle/to-positioned.js';
import { scale, linearSpace } from '@ixfx/numbers';
import { toCartesian } from './polar/conversions.js';
import { degreeToRadian } from './angles.js';
const cos = Math.cos;
const sin = Math.sin;
//const asin = Math.asin;
const sqrt = Math.sqrt;
const pow = Math.pow;
const pi = Math.PI;
const piPi = Math.PI * 2;
const goldenAngle = pi * (3 - sqrt(5));
const goldenSection = (1 + sqrt(5)) / 2;

/**
 * Options for a Vogel spiral
 */
export type VogelSpiralOpts = {
  /**
   * Upper limit of points to produce.
   * By default, 5000.
   */
  readonly maxPoints?: number;
  /**
   * Density value (0..1) which determines spacing of points.
   * This is useful because it scales with whatever circle radius is given
   * Use this parameter OR the `spacing` parameter.
   */
  readonly density?: number;
  /**
   * Spacing between points.
   * Use this option OR the density value.
   */
  readonly spacing?: number;
  /**
   * Rotation offset to apply, in radians. 0 by default
   */
  readonly rotation?: number;
};

/**
 * Generates points on a Vogel spiral - a sunflower-like arrangement of points.
 *
 * @example With no arguments, assumes a unit circle
 * ```js
 * for (const pt of circleVogelSpiral()) {
 *  // Generate points on a unit circle, with 95% density
 * }
 * ```
 *
 *
 * @example Specifying a circle and options
 * ```js
 * const circle = { radius: 100, x: 100, y: 100 };
 * const opts = {
 *  maxPoints: 50,
 *  density: 0.99
 * };
 * for (const pt of circleVogelSpiral(circle, opts)) {
 *  // Do something with point...
 * }
 * ```
 *
 * @example Array format
 * ```js
 * const ptsArray = [...circleVogelSpiral(circle, opts)];
 * ```
 * @param circle
 * @param opts
 */
export function* circleVogelSpiral(
  circle?: Circle,
  opts: VogelSpiralOpts = {}
): IterableIterator<Point> {
  const maxPoints = opts.maxPoints ?? 5000;
  const density = opts.density ?? 0.95;
  const rotationOffset = opts.rotation ?? 0;

  const c = circleToPositioned(circle ?? { radius: 1, x: 0, y: 0 });
  const max = c.radius;
  let spacing = c.radius * scale(density, 0, 1, 0.3, 0.01);
  if (opts.spacing) spacing = opts.spacing;

  let radius = 0;
  let count = 0;
  let angle = 0;
  while (count < maxPoints && radius < max) {
    radius = spacing * count ** 0.5;
    angle = rotationOffset + (count * 2 * pi) / goldenSection;
    yield Object.freeze({
      x: c.x + radius * cos(angle),
      y: c.y + radius * sin(angle),
    });
    count++;
  }
}


/**
 * Fibonacci sphere algorithm. Generates points
 * distributed on a sphere.
 *
 * @example Generate points of a unit sphere
 * ```js
 * for (const pt of sphereFibonacci(100)) {
 *  // pt.x, pt.y, pt.z
 * }
 * ```
 *
 * @example Generate points into an array
 * ```js
 * const sphere = { radius: 10, x: 10, y: 200 }
 * const pts = [...sphereFibonacci(100, 0, sphere)];
 * ```
 *
 * Source: https://codepen.io/elchininet/pen/vXeRyL
 *
 * @param samples
 * @returns
 */
export function* sphereFibonacci(
  samples = 100,
  rotationRadians = 0,
  sphere?: Sphere
): IterableIterator<Point3d> {
  const offset = 2 / samples;
  const s = sphere ?? { x: 0, y: 0, z: 0, radius: 1 };

  for (let index = 0; index < samples; index++) {
    const y = index * offset - 1 + offset / 2;
    const r = sqrt(1 - pow(y, 2));
    const a = ((index + 1) % samples) * goldenAngle + rotationRadians;
    const x = cos(a) * r;
    const z = sin(a) * r;
    yield Object.freeze({
      x: s.x + x * s.radius,
      y: s.y + y * s.radius,
      z: s.z + z * s.radius,
    });
  }
}

export type RingOptionsCount = {
  count: number
}
export type RingOptionsRadianInterval = {
  radians: number
}
export type RingOptionsDegreeInterval = {
  degrees: number
}

/**
 * Yields points distributed around a ring.
 * ```js
 * // 5 points evenly distributed
 * for (const point of ring(circle, { count: 5})) {
 *   // { x, y }
 * }
 * 
 * // Get a list of points, spaced by 10 degrees
 * const points = [...ring(circle, { degrees: 0.1 })]
 * ```
 * @param circle 
 * @param opts 
 */
export function* ring(circle: CirclePositioned, opts: { offset?: number } & (RingOptionsCount | RingOptionsRadianInterval | RingOptionsDegreeInterval)): Generator<Point, void, unknown> {
  let intervalRad = pi;
  let angleRadian = opts.offset ?? 0;
  if (`count` in opts) {
    intervalRad = (piPi - angleRadian) / opts.count;
  } else if (`radians` in opts) {
    intervalRad = opts.radians;
  } else if (`degrees` in opts) {
    intervalRad = degreeToRadian(opts.degrees);
  }
  if (angleRadian < 0) throw new Error(`Offset should be at least 0`);
  if (angleRadian > piPi) throw new Error(`Offset should be less than 2*PI`);
  if (intervalRad === 0) throw new Error(`Interval cannot be 0`);
  while (angleRadian < piPi) {
    const pt = toCartesian({ angleRadian, distance: circle.radius }, circle);
    yield pt;
    angleRadian += intervalRad;
  }
}