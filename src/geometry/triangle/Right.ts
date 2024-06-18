import type { Circle } from "../circle/CircleType.js";
import type { Point } from "../point/PointType.js";
import type { Triangle } from "./TriangleType.js";
export type Right = {
  readonly adjacent?: number;
  readonly hypotenuse?: number;
  readonly opposite?: number;
};

export type DefinedRight = {
  readonly adjacent: number;
  readonly hypotenuse: number;
  readonly opposite: number;
};

/**
 * Returns a positioned triangle from a point for A.
 *
 * ```
 *             c (90 deg)
 *             .
 *          .   .
 *       .       .
 *    .           .
 * a .............. b
 * ```
 * @param t
 * @param origin
 * @returns
 */
export const fromA = (
  t: Right,
  origin?: Point
): Triangle => {
  if (!origin) origin = Object.freeze({ x: 0, y: 0 })
  const tt = resolveLengths(t);
  const seg = hypotenuseSegments(t);
  const h = height(t);
  const a = { x: origin.x, y: origin.y };
  const b = { x: origin.x + tt.hypotenuse, y: origin.y };
  const c = { x: origin.x + seg[ 1 ], y: origin.y - h };
  return { a, b, c };
};

/**
 * Returns a positioned triangle from a point for B.
 *
 * ```
 *             c (90 deg)
 *             .
 *          .   .
 *       .       .
 *    .           .
 * a .............. b
 * ```
 * @param t
 * @param origin
 * @returns
 */
export const fromB = (
  t: Right,
  origin?: Point
): Triangle => {
  if (!origin) origin = Object.freeze({ x: 0, y: 0 })

  const tt = resolveLengths(t);
  const seg = hypotenuseSegments(t);
  const h = height(t);
  const b = { x: origin.x, y: origin.y };
  const a = { x: origin.x - tt.hypotenuse, y: origin.y };
  const c = { x: origin.x - seg[ 0 ], y: origin.y - h };
  return { a, b, c };
};

/**
 * Returns a positioned triangle from a point for C.
 *
 * ```
 *             c (90 deg)
 *             .
 *          .   .
 *       .       .
 *    .           .
 * a .............. b
 * ```
 *
 *
 * ```js
 * // Triangle pointing up to 0,0 with sides of 15
 * Triangles.Right.fromC({ adjacent: 15, opposite:15 }, { x: 0, y: 0 });
 * ```
 * @param t
 * @param origin
 * @returns
 */
export const fromC = (
  t: Right,
  origin?: Point
): Triangle => {
  if (!origin) origin = Object.freeze({ x: 0, y: 0 })

  const seg = hypotenuseSegments(t);
  const h = height(t);
  const c = { x: origin.x, y: origin.y };
  const a = { x: origin.x - seg[ 1 ], y: origin.y + h };
  const b = { x: origin.x + seg[ 0 ], y: origin.y + h };
  return { a, b, c };
};

/**
 * Returns a right triangle with all lengths defined.
 * At least two lengths must already exist
 * @param t
 * @returns
 */
export const resolveLengths = (t: Right): DefinedRight => {
  const a = t.adjacent;
  const o = t.opposite;
  const h = t.hypotenuse;

  if (a !== undefined && o !== undefined) {
    return {
      ...t,
      adjacent: a,
      opposite: o,
      hypotenuse: Math.hypot(a, o),
    };
  } else if (a && h) {
    return {
      ...t,
      adjacent: a,
      hypotenuse: h,
      opposite: h * h - a * a,
    };
  } else if (o && h) {
    return {
      ...t,
      hypotenuse: h,
      opposite: o,
      adjacent: h * h - o * o,
    };
  } else if (t.opposite && t.hypotenuse && t.adjacent) {
    return t as DefinedRight;
  }
  throw new Error(`Missing at least two edges`);
};

/**
 * Height of right-triangle
 * @param t
 * @returns
 */
export const height = (t: Right): number => {
  const tt = resolveLengths(t);
  const p = (tt.opposite * tt.opposite) / tt.hypotenuse;
  const q = (tt.adjacent * tt.adjacent) / tt.hypotenuse;
  return Math.sqrt(p * q);
};

/**
 * Returns the lengths of the hypotenuse split into p and q segments.
 * In other words, if one makes a line from the right-angle vertex down to hypotenuse.
 *
 * [See here](https://rechneronline.de/pi/right-triangle.php)
 * @param t
 * @returns
 */
export const hypotenuseSegments = (
  t: Right
): readonly [ p: number, q: number ] => {
  const tt = resolveLengths(t);
  const p = (tt.opposite * tt.opposite) / tt.hypotenuse;
  const q = (tt.adjacent * tt.adjacent) / tt.hypotenuse;
  return [ p, q ];
};

export const perimeter = (t: Right): number => {
  const tt = resolveLengths(t);
  return tt.adjacent + tt.hypotenuse + tt.opposite;
};

export const area = (t: Right): number => {
  const tt = resolveLengths(t);
  return (tt.opposite * tt.adjacent) / 2;
};

/**
 * Angle (in radians) between hypotenuse and adjacent edge
 * @param t
 * @returns
 */
export const angleAtPointA = (t: Right): number => {
  const tt = resolveLengths(t);
  return Math.acos(
    (tt.adjacent * tt.adjacent +
      tt.hypotenuse * tt.hypotenuse -
      tt.opposite * tt.opposite) /
    (2 * tt.adjacent * tt.hypotenuse)
  );
};

/**
 * Angle (in radians) between opposite edge and hypotenuse
 * @param t
 * @returns
 */
export const angleAtPointB = (t: Right): number => {
  const tt = resolveLengths(t);
  return Math.acos(
    (tt.opposite * tt.opposite +
      tt.hypotenuse * tt.hypotenuse -
      tt.adjacent * tt.adjacent) /
    (2 * tt.opposite * tt.hypotenuse)
  );
};

/**
 * Returns the median line lengths a, b and c in an array.
 *
 * The median lines are the lines from each vertex to the center.
 *
 * @param t
 * @returns
 */
export const medians = (
  t: Right
): readonly [ a: number, b: number, c: number ] => {
  const tt = resolveLengths(t);
  const b = tt.adjacent * tt.adjacent;
  const c = tt.hypotenuse * tt.hypotenuse;
  const a = tt.opposite * tt.opposite;

  return [
    Math.sqrt(2 * (b + c) - a) / 2,
    Math.sqrt(2 * (c + a) - b) / 2,
    Math.sqrt(2 * (a + b) - c) / 2,
  ];
};

/**
 * The circle which passes through the points of the triangle
 * @param t
 * @returns
 */
export const circumcircle = (t: Right): Circle => {
  const tt = resolveLengths(t);
  return { radius: tt.hypotenuse / 2 };
};

/**
 * Circle enclosed by triangle
 * @param t
 * @returns
 */
export const incircle = (t: Right): Circle => {
  const tt = resolveLengths(t);
  return {
    radius: (tt.adjacent + tt.opposite - tt.hypotenuse) / 2,
  };
};

/**
 * Returns the opposite length of a right-angle triangle,
 * marked here
 *
 * ```
 *    .  <
 *   ..  <
 * ....  <
 * ```
 *
 * This is just:
 * ```js
 * opposite = Math.tan(angle) * adjacent
 * ```
 * @param angleRad
 * @param adjacent
 * @returns
 */
export const oppositeFromAdjacent = (
  angleRad: number,
  adjacent: number
): number => Math.tan(angleRad) * adjacent;

/**
 * Returns the opposite length of a right-angle triangle,
 * marked here
 *
 * ```
 *    .  <
 *   ..  <
 * ....  <
 * ```
 *
 * This is just:
 * ```js
 * opposite = Math.tan(angle) * adjacent
 * ```
 * @param angleRad
 * @param hypotenuse
 * @returns
 */
export const oppositeFromHypotenuse = (
  angleRad: number,
  hypotenuse: number
): number => Math.sin(angleRad) * hypotenuse;

/**
 * Returns the adjecent length of a right-angle triangle,
 * marked here
 * ```
 *    .
 *   ..  o
 * ....
 * ^^^^
 * ```
 * This is just:
 * ```js
 * opposite = Math.tan(angle) * adjacent
 * ```
 * @param angleRad
 * @param adjacent
 * @returns
 */
export const adjacentFromHypotenuse = (
  angleRad: number,
  hypotenuse: number
): number => Math.cos(angleRad) * hypotenuse;

/**
 * Returns the adjecent length of a right-angle triangle,
 * marked here
 * ```
 *    .
 *   ..  o
 * ....
 * ^^^^
 * ```
 * This is just:
 * ```js
 * opposite = Math.tan(angle) * adjacent
 * ```
 * @param angleRad
 * @param opposite
 * @returns
 */
export const adjacentFromOpposite = (
  angleRad: number,
  opposite: number
): number => opposite / Math.tan(angleRad);

/**
 * Returns the hypotenuse length of a right-angle triangle,
 * marked here
 * ```
 *      .
 * >   ..
 * >  ...
 * > ....  opp
 *  .....
 *   adj
 * ```
 * This is just:
 * ```js
 * opposite = Math.tan(angle) * adjacent
 * ```
 * @param angleRad
 * @param adjacent
 * @returns
 */
export const hypotenuseFromOpposite = (
  angleRad: number,
  opposite: number
): number => opposite / Math.sin(angleRad);

/**
 * Returns the hypotenuse length of a right-angle triangle,
 * marked here
 * ```
 *      .
 * >   ..
 * >  ...
 * > ....  opp
 *  .....
 *   adj
 * ```
 * This is just:
 * ```js
 * opposite = Math.tan(angle) * adjacent
 * ```
 * @param angleRad
 * @param adjacent
 * @returns
 */
export const hypotenuseFromAdjacent = (
  angleRad: number,
  adjacent: number
): number => adjacent / Math.cos(angleRad);
