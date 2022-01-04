/* eslint-disable */
import {Point} from './Point.js';
import {guard as guardPoint} from './Point.js';

import * as MathUtil from './Math.js';
import {Path} from './Path.js';
import * as Rects from './Rect.js';

const isCircle = (p: Circle | Point): p is Circle => (p as Circle).radius !== undefined;
const isCirclePositioned = (p: Circle | Point): p is CirclePositioned => (p as CirclePositioned).radius !== undefined && (p as CirclePositioned).x !== undefined && (p as CirclePositioned).y !== undefined;

export type Circle = {
  readonly radius: number
}

export type Arc = {
  readonly radius:number
}

export type CirclePositioned = Point & Circle;
export type CircularPath = Circle & Path;

const PIPI = Math.PI *2;

export const pointOnCircle = ( circle:Circle|CirclePositioned, angleRadian:number, origin?:Point): Point => {
  if (origin === undefined) {
    if (isCirclePositioned(circle)) {
      origin = circle;
    } else {
      origin = {x:0, y:0}
    }
  }
  return {
    x: (Math.cos(angleRadian) * circle.radius) + origin.x,
    y: (Math.sin(angleRadian) * circle.radius) + origin.y
  };
};
/**
 *
 * 
 * `compute(t)`
 * @param {CirclePositioned} circle
 * @returns {CircularPath}
 */
const circleToPath = (circle:CirclePositioned): CircularPath => {
  return {
    ...circle,
    
    compute: (t:number) => pointOnCircle(circle, t*PIPI),
    bbox:() => bbox(circle),
    length: () => 0,
    toSvgString: () => 'blerg'
  }
}

export const bbox = (circle:CirclePositioned):Rects.Rect => Rects.fromCenter(circle, circle.radius, circle.radius);


export const arcToSvg = (origin:Point, radius:number, startAngle:number, endAngle:number) => {
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