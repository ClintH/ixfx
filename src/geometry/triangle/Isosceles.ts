
import type { Circle } from "../circle/CircleType.js";
import type { Point } from "../point/PointType.js";
import type { Triangle } from "./TriangleType.js";
export type Isosceles = {
  readonly legs: number;
  readonly base: number;
};

export const baseAngle = (t: Isosceles): number =>
  Math.acos(t.base / (2 * t.legs));

export const apexAngle = (t: Isosceles): number => {
  const aa = t.legs * t.legs;
  const cc = t.base * t.base;
  return Math.acos((2 * aa - cc) / (2 * aa));
};

export const height = (t: Isosceles): number => {
  const aa = t.legs * t.legs;
  const cc = t.base * t.base;
  return Math.sqrt((4 * aa - cc) / 4);
};

export const legHeights = (t: Isosceles): number => {
  const b = baseAngle(t);
  return t.base * Math.sin(b);
};

export const perimeter = (t: Isosceles): number => 2 * t.legs + t.base;

export const area = (t: Isosceles): number => {
  const h = height(t);
  return (h * t.base) / 2;
};

export const circumcircle = (t: Isosceles): Circle => {
  const h = height(t);
  const hh = h * h;
  const cc = t.base * t.base;
  return { radius: (4 * hh + cc) / (8 * h) };
};

export const incircle = (t: Isosceles): Circle => {
  const h = height(t);
  return { radius: (t.base * h) / (2 * t.legs + t.base) };
};

export const medians = (
  t: Isosceles
): readonly [ a: number, b: number, c: number ] => {
  const aa = t.legs * t.legs;
  const cc = t.base * t.base;
  const medianAB = Math.sqrt(aa + 2 * cc) / 2;
  const medianC = Math.sqrt(4 * aa - cc) / 2;
  return [ medianAB, medianAB, medianC ];
};

/**
 * Returns a positioned `Triangle` based on a center origin.
 * Center is determined by the intesecting of the medians.
 *
 * See: https://rechneronline.de/pi/isosceles-triangle.php
 * @param t
 * @param origin
 * @returns
 */
export const fromCenter = (
  t: Isosceles,
  origin?: Point
): Triangle => {
  if (!origin) origin = Object.freeze({ x: 0, y: 0 })
  const h = height(t);
  const incircleR = incircle(t).radius;
  const verticalToApex = h - incircleR;

  const a = { x: origin.x - t.base / 2, y: origin.y + incircleR };
  const b = { x: origin.x + t.base / 2, y: origin.y + incircleR };
  const c = { x: origin.x, y: origin.y - verticalToApex };
  return { a, b, c };
};

export const fromA = (
  t: Isosceles,
  origin?: Point
): Triangle => {
  if (!origin) origin = Object.freeze({ x: 0, y: 0 })

  const h = height(t);
  const a = { x: origin.x, y: origin.y };
  const b = { x: origin.x + t.base, y: origin.y };
  const c = { x: origin.x + t.base / 2, y: origin.y - h };
  return { a, b, c };
};

export const fromB = (
  t: Isosceles,
  origin?: Point
): Triangle => {
  if (!origin) origin = Object.freeze({ x: 0, y: 0 })

  const h = height(t);
  const b = { x: origin.x, y: origin.y };
  const a = { x: origin.x - t.base, y: origin.y };
  const c = { x: origin.x - t.base / 2, y: origin.y - h };
  return { a, b, c };
};

export const fromC = (
  t: Isosceles,
  origin?: Point
): Triangle => {
  if (!origin) origin = Object.freeze({ x: 0, y: 0 })
  const h = height(t);
  const c = { x: origin.x, y: origin.y };
  const a = { x: origin.x - t.base / 2, y: origin.y + h };
  const b = { x: origin.x + t.base / 2, y: origin.y + h };
  return { a, b, c };
};
