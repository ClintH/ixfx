import { Sphere } from "./Sphere.js";
import * as Points from './Point.js';
import { Circle, CirclePositioned, toPositioned as circleToPositioned } from "./Circle.js";
import { scale } from "../data/Scale.js";
import { linearSpace } from "../Numbers.js";

const cos = Math.cos;
const sin = Math.sin;
const asin = Math.asin;
const sqrt = Math.sqrt;
const pow = Math.pow;
const pi = Math.PI;
const piPi = Math.PI*2;
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
  readonly maxPoints?:number
  /**
   * Density value (0..1) which determines spacing of points.
   * This is useful because it scales with whatever circle radius is given
   * Use this parameter OR the `spacing` parameter.
   */
  readonly density?:number
  /**
   * Spacing between points.
   * Use this option OR the density value.
   */
  readonly spacing?:number
  /**
   * Rotation offset to apply, in radians. 0 by default
   */
  readonly rotation?:number
}

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
export function* circleVogelSpiral(circle?:Circle, opts:VogelSpiralOpts = {}):IterableIterator<Points.Point> {
  const maxPoints = opts.maxPoints ?? 5000;
  const density = opts.density ?? 0.95;
  const rotationOffset = opts.rotation ?? 0;

  const c = circleToPositioned(circle ?? { radius: 1, x: 0, y: 0 });
  const max = c.radius;
  //eslint-disable-next-line functional/no-let
  let spacing = c.radius * scale(density, 0, 1, 0.3, 0.01);
  if (opts.spacing) spacing = opts.spacing;

  //eslint-disable-next-line functional/no-let
  let radius = 0;
  //eslint-disable-next-line functional/no-let
  let count = 0;
  //eslint-disable-next-line functional/no-let
  let angle = 0;
  while (count < maxPoints && radius < max) {
    radius = spacing * count ** 0.5;
    angle = rotationOffset + ((count * 2 * pi) / goldenSection);
    yield Object.freeze({
      x: c.x + (radius * cos(angle)),
      y: c.y + (radius * sin(angle))
    });
    count++;
  }
}

export type CircleRingsOpts = {
  readonly rings?:number
  /**
   * Rotation offset, in radians
   */
  readonly rotation?:number
}
/**
 * Generates points spaced out on the given number of rings.
 * 
 * Get points as array
 * ```js
 * const circle = { radius: 5, x: 100, y: 100 };
 * const opts = { rings: 5 };
 * const points = [...circleRings(circle, rings)];
 * ```
 * 
 * Or iterate over them
 * ```js
 * for (const point of circleRings(circle, opts)) {
 * }
 * ```
 * Source: http://www.holoborodko.com/pavel/2015/07/23/generating-equidistant-points-on-unit-disk/#more-3453
 * @param circle 
 */
export function* circleRings(circle?:Circle|CirclePositioned, opts:CircleRingsOpts = {}):IterableIterator<Points.Point> {
  const rings = opts.rings ?? 5;
  const c = circleToPositioned(circle ?? { radius: 1, x: 0, y: 0 });
  const ringR = 1/rings;
  const rotationOffset = opts.rotation ?? 0;

  //eslint-disable-next-line functional/no-let
  let ringCount = 1;
  
  // Origin
  yield Object.freeze({ x: c.x, y: c.y });

  //eslint-disable-next-line functional/no-let
  for (let r=ringR;r<=1;r+=ringR) {
    const n = Math.round(pi/asin(1/(2*ringCount)));
    for (const theta of linearSpace(0, piPi, n+1)) {
      yield Object.freeze({
        x: c.x + (r*cos(theta + rotationOffset) * c.radius),
        y: c.y + (r*sin(theta + rotationOffset) * c.radius)
      });
    }
    ringCount++;
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
export function* sphereFibonacci(samples:number = 100, rotationRadians:number = 0, sphere?:Sphere):IterableIterator<Points.Point3d> {
  const offset = 2 / samples;
  const s = sphere ?? { x: 0, y: 0, z: 0, radius: 1 };

  //eslint-disable-next-line functional/no-let
  for (let i=0;i<samples;i++) {
    const y = (i * offset - 1) + (offset / 2);
    const r = sqrt(1 - pow(y, 2));
    const a = ((i + 1) % samples) * goldenAngle + rotationRadians;
    const x = cos(a) * r;
    const z = sin(a) * r;
    //eslint-disable-next-line functional/immutable-data
    yield Object.freeze({
      x: s.x + (x * s.radius), 
      y: s.y + (y * s.radius), 
      z: s.z + (z * s.radius)
    });
  }
}