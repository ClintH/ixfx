import type { Triangle, Circle, Point } from "../Types.js";

const pi4over3 = (Math.PI * 4) / 3;
const pi2over3 = (Math.PI * 2) / 3;

export type TriangleEquilateral =
  | {
    readonly length: number;
  }
  | number;

const resolveLength = (t: TriangleEquilateral): number => {
  if (typeof t === `number`) return t;
  return t.length;
};

/**
 * Returns a positioned `Triangle` from an equilateral triangle definition.
 * By default the rotation is such that point `a` and `c` are lying on the horizontal,
 * and `b` is the upward-facing tip.
 *
 * Default is a triangle pointing upwards with b at the top, c to the left and b to right on the baseline.
 *
 * Example rotation values in radians:
 * * ▶️ 0: a and c on vertical, b at the tip
 * * ◀️ Math.PI: `c`and `a` are on vertical, with `b` at the tip.
 * * 🔽 Math.PI/2: `c` and `a` are on horizontal, `c` to the left. `b` at the bottom.
 * * 🔼 Math.PI*1.5: `c` and `a` are on horizontal, `c` to the right. `b` at the top. (default)
 * @param t
 * @param origin
 * @param rotationRad
 * @returns
 */
export const fromCenter = (
  t: TriangleEquilateral,
  origin?: Point,
  rotationRad?: number
): Triangle => {
  if (!origin) origin = Object.freeze({ x: 0, y: 0 })

  const r = resolveLength(t) / Math.sqrt(3);
  const rot = rotationRad ?? Math.PI * 1.5;
  const b = {
    x: r * Math.cos(rot) + origin.x,
    y: r * Math.sin(rot) + origin.y,
  };
  const a = {
    x: r * Math.cos(rot + pi4over3) + origin.x,
    y: r * Math.sin(rot + pi4over3) + origin.y,
  };
  const c = {
    x: r * Math.cos(rot + pi2over3) + origin.x,
    y: r * Math.sin(rot + pi2over3) + origin.y,
  };

  return Object.freeze({ a, b, c });
};

/**
 * Calculate center from the given point A
 * @param t
 * @param ptA
 * @returns
 */
export const centerFromA = (
  t: TriangleEquilateral,
  ptA?: Point
): Point => {
  if (!ptA) ptA = Object.freeze({ x: 0, y: 0 })

  const r = resolveLength(t);
  const { radius } = incircle(t);
  return {
    x: ptA.x + r / 2,
    y: ptA.y - radius,
  };
};

/**
 * Calculate center from the given point B
 * @param t
 * @param ptB
 * @returns
 */
export const centerFromB = (
  t: TriangleEquilateral,
  ptB?: Point
): Point => {
  if (!ptB) ptB = Object.freeze({ x: 0, y: 0 })

  const { radius } = incircle(t);
  return {
    x: ptB.x,
    y: ptB.y + radius * 2,
  };
};

/**
 * Calculate center from the given point C
 * @param t
 * @param ptC
 * @returns
 */
export const centerFromC = (
  t: TriangleEquilateral,
  ptC?: Point
): Point => {
  if (!ptC) ptC = Object.freeze({ x: 0, y: 0 })

  const r = resolveLength(t);
  const { radius } = incircle(t);

  return {
    x: ptC.x - r / 2,
    y: ptC.y - radius,
  };
};

/**
 * Returns the height (or rise) of an equilateral triangle.
 * Ie. from one vertex to the perpendicular edge.
 * (line marked x in the diagram below)
 *
 * ```
 *      .
 *     .x .
 *    . x  .
 *   .  x   .
 *  ..........
 * ```
 * @param t
 */
export const height = (t: TriangleEquilateral): number =>
  (Math.sqrt(3) / 2) * resolveLength(t);

export const perimeter = (t: TriangleEquilateral): number =>
  resolveLength(t) * 3;

export const area = (t: TriangleEquilateral): number =>
  (Math.pow(resolveLength(t), 2) * Math.sqrt(3)) / 4;

/**
 * Circle that encompasses all points of triangle
 * @param t
 */
export const circumcircle = (t: TriangleEquilateral): Circle => ({
  radius: (Math.sqrt(3) / 3) * resolveLength(t),
});

/**
 * Circle that is inside the edges of the triangle
 * @param t
 * @returns
 */
export const incircle = (t: TriangleEquilateral): Circle => ({
  radius: (Math.sqrt(3) / 6) * resolveLength(t),
});
