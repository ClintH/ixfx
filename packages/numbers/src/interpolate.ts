import { wrap } from './wrap.js';
import { numberTest, resultThrow } from '@ixfx/guards';
import { clamp } from './clamp.js';
import { piPi } from './pi-pi.js';

/**
 * Interpolation options.
 * 
 * Limit: What to do if interpolation amount exceeds 0..1 range
 * * clamp: lock to A & B (inclusive) Default.
 * * wrap: wrap from end to start again
 * * ignore: allow return values outside of A..B range
 * 
 * Transform: name of function to transform `amount` prior to interpolate. This is useful for creating non-linear interpolation results.
 * 
 * For example:
 * ```js
 * // Divide interpolation amount in half
 * const interpolatorInterval({ mins: 1 }, 10, 100, {
 *  transform: (amount) => amount * Math.random()
 * });
 * ```
 * In the above example, the results would get more random over time.
 * `interpolatorInterval` will still step through the interpolation range of 0..1 in an orderly fashion, but we're transforming that range using a custom function before producing the result. 
 * 
 */
export type BasicInterpolateOptions = {
  limits: `clamp` | `wrap` | `ignore`
  transform: (v: number) => number
}

/**
 * Returns an interpolation function with a fixed interpolation amount. This
 * function will need the A and B values to interpolate between (ie start and end)
 * 
 * Interpolation amount is usually 0..1, where 0 will return the A value, 1 will return the B value, 0.5 will be halfway between the two etc.
 * 
 * ```js
 * // Create function
 * const fn = interpolate(0.1);
 * 
 * // Later, use to interpolate between a and b
 * fn(50, 100); // 10% of 50..100 range
 * ```
 * 
 * This is useful if you have a fixed interpolation amount, but varying A and B values.
 * @param amount Interpolation value (0..1 usually)
 * @param options Options
 */
export function interpolate(amount: number, options?: Partial<BasicInterpolateOptions>): (a: number, b: number) => number;

/**
 * Interpolates between `a` and `b` by `amount`.
 * 
 * Interpolation amount is usually 0..1, where 0 will return the A value, 1 will return the B value, 0.5 will be halfway between the two etc.
 * 
 * ```js
 * // Get the value at 10% of range between 50-100
 * const fn = interpolate(0.1, 50, 100);
 * ```
 * 
 * This is useful if you have dynamic interpolation amount as well as A & B values.
 * Consider using `interpolate(amount)` if you have a fixed interpolation amount.
 * @param amount Interpolation value (0..1 usually)
 * @param a Starting value (corresponding to an interpolation of 0)
 * @param b End value (corresponding to an interpolation value of 1)
 * @param options Options
 */
export function interpolate(amount: number, a: number, b: number, options?: Partial<BasicInterpolateOptions>): number;

/**
 * Returns an interpolation function with a fixed A and B values.
 * The returned function requires an interpolation amount. This is usually 0..1, where 0 will return the A value, 1 will return the B value, 0.5 will be halfway between the two etc.
 * 
 * ```js
 * // Create function to interpolate between 50..100
 * const fn = interpolate(50, 100);
 * 
 * // Later, use to interpolate
 * fn(0.1); // 10% of 50..100 range
 * ```
 * @param a Starting value (corresponding to an interpolation of 0)
 * @param b End value (corresponding to an interpolation value of 1)
 * @param options Options
 */
export function interpolate(a: number, b: number, options?: Partial<BasicInterpolateOptions>): (amount: number) => number;

/**
 * Interpolates between `a` and `b` by `amount`. Aka `lerp`.
 *
 * [ixfx Guide on Interpolation](https://ixfx.fun/data/interpolation/overview/)
 *
 * @example Get the halfway point between 30 and 60
 * ```js
 * interpolate(0.5, 30, 60);
 * ```
 *
 * See also {@link interpolatorStepped} and {@link interpolatorInterval} for functions
 * which help to manage progression from A->B over steps or interval.
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
 * 
 * There are a few variations when calling `interpolate`, depending on what parameters are fixed.
 * * `interpolate(amount)`: returns a function that needs a & b 
 * * `interpolate(a, b)`:  returns a function that needs the interpolation amount
 */
export function interpolate(pos1: number, pos2?: number | Partial<BasicInterpolateOptions>, pos3?: number | Partial<BasicInterpolateOptions>, pos4?: Partial<BasicInterpolateOptions>) {
  let amountProcess: undefined | ((v: number) => number);
  let limits: BasicInterpolateOptions[ 'limits' ] = `clamp`;

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
    resultThrow(
      numberTest(_a, ``, `a`),
      numberTest(_b, ``, `b`),
      numberTest(_amt, ``, `amount`)
    );
    _amt = handleAmount(_amt);
    return (1 - _amt) * _a + _amt * _b
  }


  const readOpts = (o: Partial<BasicInterpolateOptions> = {}) => {
    if (o.transform) {
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
    const amount = handleAmount(pos1);
    readOpts(pos2);
    resultThrow(numberTest(amount, ``, `amount`));
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
export const interpolatorStepped = (incrementAmount: number, a = 0, b = 1, startInterpolationAt = 0, options?: Partial<BasicInterpolateOptions>) => {
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
  options?: Partial<BasicInterpolateOptions>
): number => {
  const t = wrap(bRadians - aRadians, 0, piPi);
  return interpolate(amount, aRadians, aRadians + (t > Math.PI ? t - piPi : t), options);
};

