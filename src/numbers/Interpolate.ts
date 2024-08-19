import type { Interval } from '../flow/IntervalType.js';
import { wrap } from './Wrap.js';
import { ofTotal } from '../flow/Timer.js';
import { throwNumberTest } from '../util/GuardNumbers.js';
import { clamp } from '../numbers/Clamp.js';
import { get as getEasing, type EasingName } from '../modulation/easing/index.js';
export const piPi = Math.PI * 2;

/**
 * 
 * Limit
 * What to do if interpolation amount exceeds 0..1 range
 * * clamp: lock to A & B (inclusive) Default.
 * * wrap: wrap from end to start again
 * * ignore: allow return values outside of A..B range
 * 
 * Easing: name of easing function for non-linear interpolation
 * 
 * Transform: name of function to transform `amount` prior to interpolate. 
 */
export type InterpolateOptions = {
  limits: `clamp` | `wrap` | `ignore`
  easing: EasingName,
  transform: (v: number) => number
}


export function interpolate(amount: number, options?: Partial<InterpolateOptions>): (a: number, b: number) => number;
export function interpolate(amount: number, a: number, b: number, options?: Partial<InterpolateOptions>): number;
export function interpolate(a: number, b: number, options?: Partial<InterpolateOptions>): (amount: number) => number;
/**
 * Interpolates between `a` and `b` by `amount`. Aka `lerp`.
 *
 * [ixfx Guide on Interpolation](https://ixfx.fun/data/interpolation/overview/)
 *
 * @example Get the halfway point between 30 and 60
 * ```js
 * import { interpolate } from 'https://unpkg.com/ixfx/dist/numbers.js';
 * interpolate(0.5, 30, 60);
 * ```
 *
 * Interpolation is often used for animation. In that case, `amount`
 * would start at 0 and you would keep interpolating up to `1`
 * @example
 * ```js
 * import { interpolate } from 'https://unpkg.com/ixfx/dist/numbers.js';
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
 * Alternatively, set the `limits` option to process `amount`:
 * * 'wrap': wrap amount, eg 1.5 is the same as 0.5, 2 is the same as 1
 * * 'ignore': allow exceeding values. eg 1.5 will yield b*1.5.
 * * 'clamp': default behaviour of clamping interpolation amount to 0..1
 * 
 * Interpolation can be non-linear using 'easing' option or 'transform' funciton.
 * ```js
 * interpolate(0.1, 0, 100, { easing: `quadIn` });
 * ```
 * To interpolate certain types: {@link Visual.Colour.interpolator | Visual.Colour.interpolator }, {@link Geometry.Points.interpolate | Points.interpolate}.
 */
export function interpolate(pos1: number, pos2?: number | Partial<InterpolateOptions>, pos3?: number | Partial<InterpolateOptions>, pos4?: Partial<InterpolateOptions>) {
  let amountProcess: undefined | ((v: number) => number);
  let limits: InterpolateOptions[ 'limits' ] = `clamp`;

  const handleAmount = (amount: number) => {
    if (amountProcess) amount = amountProcess(amount);
    if (limits === undefined || limits === `clamp`) {
      amount = clamp(amount);
    } else if (limits === `wrap`) {
      if (amount > 1) amount = amount % 1;
      else if (amount < 0) {
        amount = 1 + (amount % 1);
      }
    }
    return amount;
  }

  const doTheEase = (_amt: number, _a: number, _b: number) => {
    throwNumberTest(_a, ``, `a`);
    throwNumberTest(_b, ``, `b`);
    throwNumberTest(_amt, ``, `amount`);
    _amt = handleAmount(_amt);
    return (1 - _amt) * _a + _amt * _b
  }


  const readOpts = (o: Partial<InterpolateOptions> = {}) => {
    if (o.easing) {
      const easingFn = getEasing(o.easing);
      if (!easingFn) throw new Error(`Easing function '${ o.easing }' not found`);
      amountProcess = easingFn;
    } else if (o.transform) {
      if (typeof o.transform !== `function`) throw new Error(`Param 'transform' is expected to be a function. Got: ${ typeof o.transform }`);
      amountProcess = o.transform;
    }
    limits = o.limits ?? `clamp`;
  }

  const rawEase = (_amt: number, _a: number, _b: number) => (1 - _amt) * _a + _amt * _b

  if (typeof pos1 !== `number`) throw new TypeError(`First param is expected to be a number. Got: ${ typeof pos1 }`);
  if (typeof pos2 === `number`) {
    let a: number;
    let b: number;
    if (pos3 === undefined || typeof pos3 === `object`) {
      //interpolate(a: number, b: number, options?: Partial<InterpolateOptions>): (amount: number) => number;
      a = pos1;
      b = pos2;
      readOpts(pos3);
      return (amount: number) => doTheEase(amount, a, b);
    } else if (typeof pos3 === `number`) {
      //interpolate(amount: number, a: number, b: number, options?: Partial<InterpolateOptions>): number;
      a = pos2;
      b = pos3;
      readOpts(pos4);
      return doTheEase(pos1, a, b);
    } else {
      throw new Error(`Values for 'a' and 'b' not defined`);
    }
  } else if (pos2 === undefined || typeof pos2 === `object`) {
    //interpolate(amount: number, options?: Partial<InterpolateOptions>): (a:number,b:number)=>number;
    let amount = handleAmount(pos1);
    readOpts(pos2);
    throwNumberTest(amount, ``, `amount`);
    return (aValue: number, bValue: number) => rawEase(amount, aValue, bValue);
  }
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
 * @param options Options for interpolation
 * @returns 
 */
export const interpolatorStepped = (incrementAmount: number, a = 0, b = 1, startInterpolationAt = 0, options?: Partial<InterpolateOptions>) => {
  let amount = startInterpolationAt;
  return (retargetB?: number, retargetA?: number) => {
    if (retargetB !== undefined) b = retargetB;
    if (retargetA !== undefined) a = retargetA;
    if (amount >= 1) return b;
    const value = interpolate(amount, a, b, options);
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
 * @param duration Duration for interpolation
 * @param a Start point
 * @param b End point
 * @param options Options for interpolation
 * @returns 
 */
export const interpolatorInterval = (duration: Interval, a = 0, b = 1, options?: Partial<InterpolateOptions>) => {
  const durationProgression = ofTotal(duration, { clampValue: true });
  return (retargetB?: number, retargetA?: number) => {
    const amount = durationProgression();
    if (retargetB !== undefined) b = retargetB;
    if (retargetA !== undefined) a = retargetA;
    if (amount >= 1) return b;
    const value = interpolate(amount, a, b, options);
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
 * @param aRadians Start angle (radian)
 * @param bRadians End angle (radian)
 * @returns
 */
export const interpolateAngle = (
  amount: number,
  aRadians: number,
  bRadians: number,
  options?: Partial<InterpolateOptions>
): number => {
  const t = wrap(bRadians - aRadians, 0, piPi);
  return interpolate(amount, aRadians, aRadians + (t > Math.PI ? t - piPi : t), options);
};

