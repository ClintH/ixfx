import type { Interval } from 'src/flow/IntervalType.js';
import { wrap } from './Wrap.js';
import { progress } from '../flow/Elapsed.js';
import { throwNumberTest } from '../Guards.js';
import { clamp } from './Clamp.js';
export const piPi = Math.PI * 2;

export type InterpolateOptions = {
  limits: `clamp` | `wrap` | `ignore`
}

/**
 * Interpolates between `a` and `b` by `amount`. Aka `lerp`.
 *
 * [ixfx Guide](https://clinth.github.io/ixfx-docs/modulation/interpolate/)
 *
 * @example Get the halfway point between 30 and 60
 * ```js
 * import { interpolate } from 'https://unpkg.com/ixfx/dist/data.js';
 * interpolate(0.5, 30, 60);
 * ```
 *
 * Interpolation is often used for animation. In that case, `amount`
 * would start at 0 and you would keep interpolating up to `1`
 * @example
 * ```js
 * import { interpolate } from 'https://unpkg.com/ixfx/dist/data.js';
 * import { percentPingPong } from 'https://unpkg.com/ixfx/dist/modulation.js'
 *
 * // Go back and forth between 0 and 1 by 0.1
 * let pp = percentPingPong(0.1);
 * continuously(() => {
 *  // Get position in ping-pong
 *  const amt = pp.next().value;
 *  // interpolate between Math.PI and Math.PI*2
 *  const v = interpolate(amt, Math.PI, Math.PI*2);
 *  // do something with v...
 * }).start();
 * ```
 *
 * See also {@link interpolatorStepped} and {@link interpolatorInterval} for functions
 * which help to manage progression from A->B over steps or interval.
 * 
 * If two parameters are given, it instead returns a function which interpolates:
 * ```js
 * const i = interpolate(100, 200);
 * i(0.5); // 150
 * 
 * // Compared to:
 * interpolate(0.5, 100, 200); // 150
 * ```
 * 
 * This is useful if you want to reuse the interpolator with fixed `a` and `b` values.
 * 
 * Usually interpolation amount is on a 0...1 scale, inclusive. What is the interpolation result
 * if this scale is exceeded? By default it is clamped to 0..1, so the return value is always between `a` and `b` (inclusive).
 * 
 * Alternatively, set the `limits` option:
 * * 'wrap': wrap amount, eg 1.5 is the same as 0.5, 2 is the same as 1
 * * 'ignore': allow exceeding values. eg 1.5 will yield b*1.5.
 * * 'clamp': default behaviour of clamping interpolation amount to 0..1
 * 
 * To interpolate certain types: {@link Visual.Colour.interpolator | Visual.Colour.interpolator }, {@link Geometry.Points.interpolate | Geometry.Points.interpolate}.
 * @param amount Interpolation amount, between 0 and 1 inclusive
 * @param a Start (ie when `amt` is 0)
 * @param b End (ie. when `amt` is 1)
 * @returns Interpolated value which will be between `a` and `b`.
 */
export function interpolate(amount: number, a: number, b: number, options?: Partial<InterpolateOptions>): number;
export function interpolate(a: number, b: number, options?: Partial<InterpolateOptions>): (amount: number) => number;
export function interpolate(amountOrA: number, aOrB: number, bOrMissingOrOpts?: number | Partial<InterpolateOptions>, options?: Partial<InterpolateOptions>) {

  const a = bOrMissingOrOpts === undefined ? amountOrA : aOrB;
  const b = bOrMissingOrOpts === undefined || typeof bOrMissingOrOpts === `object` ? aOrB : bOrMissingOrOpts;
  // eslint-disable-next-line unicorn/no-negated-condition, @typescript-eslint/prefer-nullish-coalescing
  const opts = options !== undefined ? options : (typeof bOrMissingOrOpts === `number` ? {} : bOrMissingOrOpts);
  const limits = opts?.limits ?? `clamp`;

  throwNumberTest(a, ``, `a`);
  throwNumberTest(b, ``, `b`);

  const calculate = (amount: number) => {
    if (limits === `clamp`) {
      amount = clamp(amount);
    } else if (limits === `wrap`) {
      if (amount > 1) amount = amount % 1;
      else if (amount < 0) {
        amount = 1 + (amount % 1);
      }
    }
    throwNumberTest(amount, ``, `amount`);
    return (1 - amount) * a + amount * b;
  }
  if (bOrMissingOrOpts === undefined || typeof bOrMissingOrOpts === `object`) return calculate;
  return calculate(amountOrA);
};


/**
 * Returns a function that interpolates from A to B.
 * It steps through the interpolation with each call to the returned function.
 * This means that the `incrementAmount` will hinge on the rate
 * at which the function is called. Alternatively, consider {@link interpolatorInterval}
 * which steps on the basis of clock time.
 * 
 * ```js
 * // Interpolate from 0..1 by 0.01
 * const v = interpolatorStepped(0.01, 100, 200);
 * v(); // Each call returns a value closer to target
 * // Eg: 100, 110, 120, 130 ...
 * ```
 * 
 * Under the hood, it calls `interpolate` with an amount that
 * increases by `incrementAmount` each time.
 * 
 * When calling `v()` to step the interpolator, you can also pass
 * in new B and A values. Note that the order is swapped: the B (target) is provided first, and
 * then optionally A.
 * 
 * ```js
 * const v = interpolatorStepped(0.1, 100, 200); // Interpolate 100->200
 * v(300, 200); // Retarget to 200->300 and return result
 * v(150); // Retarget 200->150 and return result
 * ```
 * 
 * This allows you to maintain the current interpolation progress.
 * @param incrementAmount Amount to increment by
 * @param a Start value. Default: 0
 * @param b End value. Default: 1
 * @param startInterpolationAt Starting interpolation amount. Default: 0
 * @returns 
 */
export const interpolatorStepped = (incrementAmount: number, a = 0, b = 1, startInterpolationAt = 0) => {
  let amount = startInterpolationAt;
  return (retargetB?: number, retargetA?: number) => {
    if (retargetB !== undefined) b = retargetB;
    if (retargetA !== undefined) a = retargetA;
    if (amount >= 1) return b;
    const value = interpolate(amount, a, b);
    amount += incrementAmount;
    return value;
  }
}

/**
 * Interpolates between A->B over `duration`.
 * Given the same A & B values, steps will be larger if it's a longer
 * duration, and shorter if it's a smaller duration.
 * 
 * A function is returned, which when invoked yields a value between A..B.
 * 
 * Alternatively to step through by the same amount regardless
 * of time, use {@link interpolatorStepped}.
 * 
 * ```js
 * // Interpolate from 0..1 over one minute
 * const v = interpolatorInterval({mins:1});
 * v(); // Compute current value
 * ```
 * 
 * Use start and end points:
 * ```js
 * // Interpolate from 100-200 over 10 seconds
 * const v = interpolatorInterval({secs:10}, 100, 200);
 * v(); // Compute current value
 * ```
 * @param duration
 * @param a 
 * @param b 
 * @returns 
 */
export const interpolatorInterval = (duration: Interval, a = 0, b = 1) => {
  const durationProgression = progress(duration, { clampValue: true });
  return (retargetB?: number, retargetA?: number) => {
    const amount = durationProgression();
    if (retargetB !== undefined) b = retargetB;
    if (retargetA !== undefined) a = retargetA;
    if (amount >= 1) return b;
    const value = interpolate(amount, a, b);
    return value;
  }
}

/**
 * Interpolate between angles `a` and `b` by `amount`. Angles are in radians.
 *
 * ```js
 * import { interpolateAngle } from 'https://unpkg.com/ixfx/dist/data.js';
 * interpolateAngle(0.5, Math.PI, Math.PI/2);
 * ```
 * @param amount
 * @param aRadians
 * @param bRadians
 * @returns
 */
export const interpolateAngle = (
  amount: number,
  aRadians: number,
  bRadians: number
): number => {
  const t = wrap(bRadians - aRadians, 0, piPi);
  return interpolate(amount, aRadians, aRadians + (t > Math.PI ? t - piPi : t));
};

