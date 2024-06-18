import type { Path } from "../path/PathType.js";
import type { Point } from "../point/PointType.js";

export type QuadraticBezier = {
  readonly a: Point,
  readonly b: Point,
  readonly quadratic: Point
}

export type QuadraticBezierPath = Path & QuadraticBezier;
export type CubicBezier = {
  readonly a: Point,
  readonly b: Point,
  readonly cubic1: Point,
  readonly cubic2: Point,
}

export type CubicBezierPath = Path & CubicBezier;