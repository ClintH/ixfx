import type { EaseValue } from "./Types.js";
import { interpolate } from '../../numbers/Interpolate.js';
import type { SpringOptions } from "../Types.js";
const sqrt = Math.sqrt;
const pow = Math.pow;
const cos = Math.cos;
const pi = Math.PI;
const sin = Math.sin;


/**
 * Returns a mix of two easing functions.
 *
 * ```js
 * import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
 * // Get a 50/50 mix of two easing functions
 * const mix = Easings.mix(0.5, Easings.Named.sineIn, Easings.Named.sineOut);
 *
 * // 10% of sineIn, 90% of sineOut
 * Easings.mix(0.90, 0.25, Easings.Named.sineIn, Easings.Named.sineOut);
 * ```
 * @param balance Mix between a and b
 * @param easingA
 * @param easingB
 * @returns Numeric value
 */
export const mix = (
  balance: number,
  easingA: EaseValue,
  easingB: EaseValue
): EaseValue => (amt: number) => interpolate(balance, easingA(amt), easingB(amt));


/**
 * Returns a 'crossfade' of two easing functions, synchronised with the progress through the easing. That is:
 * * 0.0 will yield 100% of easingA at its `easing(0)` value.
 * * 0.2 will yield 80% of a, 20% of b, with both at their `easing(0.2)` values
 * * 0.5 will yield 50% of both functions both at their `easing(0.5)` values
 * * 0.8 will yield 20% of a, 80% of a, with both at their `easing(0.8)` values
 * * 1.0 will yield 100% of easingB at its `easing(1)` value.
 *
 * So easingB will only ever kick in at higher `amt` values and `easingA` will only be present in lower valus.
 *
 * ```js
 * import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
 * Easings.crossFade(0.5, Easings.Named.sineIn, Easings.Named.sineOut);
 * ```
 * @param amt
 * @param easingA
 * @param easingB
 * @returns Numeric value
 */
export const crossfade = (easingA: EaseValue, easingB: EaseValue): EaseValue => {
  return (amt: number) => {
    const mixer = mix(amt, easingA, easingB);
    return mixer(amt);
  }
}


/**
 * Returns a roughly gaussian easing function
 * ```js
 * import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
 * const fn = Easings.gaussian();
 * ```
 *
 * Try different positive and negative values for `stdDev` to pinch
 * or flatten the bell shape.
 * @param standardDeviation
 * @returns
 */
export const gaussian = (standardDeviation = 0.4) => {
  const a = 1 / sqrt(2 * pi);
  const mean = 0.5;

  return (t: number) => {
    const f = a / standardDeviation;
    // p:-8 pinched
    let p = -2.5; // -1/1.25;
    let c = (t - mean) / standardDeviation;
    c *= c;
    p *= c;
    const v = f * pow(Math.E, p); // * (2/pi);//0.62;
    if (v > 1) return 1;
    if (v < 0) return 0;
    return v;
  };
};


/**
 * Creates an easing function using a simple cubic bezier defined by two points.
 *
 * Eg: https://cubic-bezier.com/#0,1.33,1,-1.25
 *  a:0, b: 1.33, c: 1, d: -1.25
 *
 * ```js
 * import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
 * // Time-based easing using bezier
 * const e = Easings.time(fromCubicBezier(1.33, -1.25), 1000);
 * e.compute();
 * ```
 * @param b
 * @param d
 * @returns Value
 */
export const fromCubicBezier =
  (b: number, d: number) =>
    (t: number) => {
      const s = 1 - t;
      const s2 = s * s;
      const t2 = t * t;
      const t3 = t2 * t;
      return 3 * b * s2 * t + 3 * d * s * t2 + t3;
    };


export const spring = (opts: SpringOptions = {}): EaseValue => {
  /** MIT License github.com/pushkine/ */
  const from = 0;
  const to = 1;
  const mass = opts.mass ?? 1;
  const stiffness = opts.stiffness ?? 100;
  const soft = opts.soft ?? false;
  const damping = opts.damping ?? 10;
  const velocity = opts.velocity ?? 0.1;
  const delta = to - from;
  if (soft || 1 <= damping / (2 * Math.sqrt(stiffness * mass))) {
    const angularFrequency = -Math.sqrt(stiffness / mass);
    const leftover = -angularFrequency * delta - velocity;
    return (t: number) =>
      to - (delta + t * leftover) * Math.E ** (t * angularFrequency);
  } else {
    const dampingFrequency = Math.sqrt(4 * mass * stiffness - damping ** 2);
    const leftover =
      (damping * delta - 2 * mass * velocity) / dampingFrequency;
    const dfm = (0.5 * dampingFrequency) / mass;
    const dm = -(0.5 * damping) / mass;
    return (t: number) =>
      to -
      (Math.cos(t * dfm) * delta + Math.sin(t * dfm) * leftover) *
      Math.E ** (t * dm);
  }
};
