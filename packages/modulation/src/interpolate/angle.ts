import type { Angle, AngleConvertible, AngleRad } from "@ixfx/geometry/angles";
import type { AngleInterpolateOptions } from "./types.js";
import { angleConvert, angleParse, isAngleTypeConvertible, radianArc, radianToDegree, toRadian } from "@ixfx/geometry/angles";
import { interpolate } from "@ixfx/numbers";
import { piPi } from "../util/pi-pi.js";

export function interpolatorAngle(amount: number, a: AngleConvertible, b: AngleConvertible, options?: AngleInterpolateOptions): number;
export function interpolatorAngle(a: AngleConvertible, b: AngleConvertible, options?: AngleInterpolateOptions): (amount: number) => number;

/**
 * Interpolate between angles `a` and `b` by `amount`. Angles are in degrees unless specified otherwise.
 *
 * ```js
 * // Remmebering 0 is east, 270 is south, clockwise is negative:
 * const i = interpolatorAngle(`0deg`, `270deg`); // Defaults to 'short' direction
 * i(0.5); // 135 (north-west)
 *
 * const i = interpolatorAngle(`0deg`, `270deg`, { direction: `long` });
 * i(0.5); // 315 (south-east)
 * ```
 * @param a Start angle (assumed radian if numbers are given)
 * @param b End angle (assumed radian if numbers are given)
 * @returns Interpolated angle, using same unit as the `b` angle
 */
export function interpolatorAngle(amountOrA: AngleConvertible | number, aOrB: AngleConvertible, bOrOptions?: AngleInterpolateOptions | AngleConvertible, options?: AngleInterpolateOptions): number | ((amount: number) => number) {
  let aa: Angle | undefined;
  let bb: Angle | undefined;
  let opts: AngleInterpolateOptions | undefined;
  let amt: number = Number.NaN;

  if (typeof amountOrA === `number` && isAngleTypeConvertible(aOrB) && isAngleTypeConvertible(bOrOptions)) {
    amt = amountOrA;
    aa = angleParse(aOrB);
    bb = angleParse(bOrOptions as any);
    opts = options;
  } else {
    aa = angleParse(amountOrA);
    bb = angleParse(aOrB);
    opts = bOrOptions as AngleInterpolateOptions;
  }

  let radA = toRadian(aa);
  const radB = toRadian(bb);
  if (radA === 0 && radB > Math.PI) {
    // console.log(`--- switch!`);
    radA = piPi;
  }
  const radI = interpolatorAngleRadian(radA, radB, opts);

  const compute = (amount: number): number => {
    const r = radI(amount); // Value in radian
    // console.log(`compute: ${amount} bbUnit: ${bb.unit} r: ${r}`);
    if (bb.unit === `rad`) // Source unit is radians, return the same
      return r.value;
    // Convert to destination unit
    return angleConvert(r, bb.unit).value;
  };
  if (Number.isNaN(amt))
    return compute;
  return compute(amt);
}

export function interpolatorAngleRadian(a: number, b: number, options?: AngleInterpolateOptions): (amount: number) => AngleRad {
  const limits = options?.limits ?? `clamp`;
  const arc = radianArc(a, b, options?.direction);
  return (amount: number): AngleRad => {
    const i = interpolate(amount, 0, arc);
    // console.log(`interpolatorAngleRadian: amount: ${amount} a: ${radianToDegree(a)} b: ${Math.floor(radianToDegree(b))} arc: ${Math.floor(radianToDegree(arc))} i: ${Math.floor(radianToDegree(i))} dir: ${options?.direction} eq: ${Math.floor(radianToDegree(a + i))}`);
    // if (a + i < 0) {
    //   return { unit: `rad`, value: b - i };
    // }
    // if (arc < 0) {
    //  return { unit: `rad`, value: Math.PI * 2 + i };
    // }
    let angle = a + i;
    if (angle > piPi && limits === `clamp`) {
      angle = Math.abs(angle - piPi);
    }
    if (angle < 0 && limits === `clamp`) {
      angle = piPi + angle;
    }
    return { unit: `rad`, value: angle };
  };
}
