import { clamp, clamper } from './clamp.js';
import { numberTest, resultThrow } from '@ixfx/guards';
import type { NumberScaler, NumberScalerTwoWay } from './types.js';

/**
 * Scales `v` from an input range to an output range (aka `map`)
 *
 * For example, if a sensor's useful range is 100-500, scale it to a percentage:
 *
 * ```js
 *
 * scale(sensorReading, 100, 500, 0, 1);
 * ```
 *
 * `scale` defaults to a percentage-range output, so you can get away with:
 * ```js
 * scale(sensorReading, 100, 500);
 * ```
 *
 * If `v` is outside of the input range, it will likewise be outside of the output range.
 * Use {@link scaleClamped} to clip value to range.
 *
 * If inMin and inMax are equal, outMax will be returned.
 *
 * An easing function can be provided for non-linear scaling. In this case
 * the input value is 'pre scaled' using the function before it is applied to the
 * output range.
 *
 * ```js
 * scale(sensorReading, 100, 500, 0, 1, Easings.gaussian());
 * ```
 * @param v Value to scale
 * @param inMin Input minimum
 * @param inMax Input maximum
 * @param outMin Output minimum. If not specified, 0
 * @param outMax Output maximum. If not specified, 1
 * @param easing Easing function
 * @returns Scaled value
 */
export const scale = (
  v: number,
  inMin: number,
  inMax: number,
  outMin?: number,
  outMax?: number,
  easing?: (v: number) => number
): number => scaler(inMin, inMax, outMin, outMax, easing)(v);

/**
 * Returns a scaling function
 * @param inMin Input minimum
 * @param inMax Input maximum
 * @param outMin Output minimum. If not specified, 0
 * @param outMax Output maximum. If not specified, 1
 * @param easing Easing function
 * @param clamped If true, value is clamped. Default: false
 * @returns
 */
export const scaler = (
  inMin: number,
  inMax: number,
  outMin?: number,
  outMax?: number,
  easing?: (v: number) => number,
  clamped?: boolean
): NumberScaler => {

  resultThrow(
    numberTest(inMin, `finite`, `inMin`),
    numberTest(inMax, `finite`, `inMax`)
  );
  const oMax = outMax ?? 1;
  const oMin = outMin ?? 0;
  const clampFunction = clamped ? clamper(outMin, outMax) : undefined;

  return (v: number): number => {
    if (inMin === inMax) return oMax;

    let a = (v - inMin) / (inMax - inMin);
    if (easing !== undefined) a = easing(a);
    const x = a * (oMax - oMin) + oMin;
    if (clampFunction) return clampFunction(x);
    return x;
  };
};

/**
 * Returns a 'null' scaler that does nothing - the input value is returned as output.
 * @returns 
 */
export const scalerNull = (): NumberScaler => (v: number) => v;

/**
 * As {@link scale}, but result is clamped to be
 * within `outMin` and `outMax`.
 *
 * @param v
 * @param inMin
 * @param inMax
 * @param outMin 1 by default
 * @param outMax 0 by default d
 * @param easing
 * @returns
 */
export const scaleClamped = (
  v: number,
  inMin: number,
  inMax: number,
  outMin?: number,
  outMax?: number,
  easing?: (v: number) => number
): number => {
  if (typeof outMax === `undefined`) outMax = 1;
  if (typeof outMin === `undefined`) outMin = 0;
  if (inMin === inMax) return outMax;

  const x = scale(v, inMin, inMax, outMin, outMax, easing);
  return clamp(x, outMin, outMax);
};

/**
 * Scales an input percentage to a new percentage range.
 *
 * If you have an input percentage (0-1), `scalePercentageOutput` maps it to an
 * _output_ percentage of `outMin`-`outMax`.
 *
 * ```js
 * // Scales 50% to a range of 0-10%
 * scalePercentages(0.5, 0, 0.10); // 0.05 - 5%
 * ```
 *
 * An error is thrown if any parameter is outside of percentage range. This added
 * safety is useful for catching bugs. Otherwise, you could just as well call
 * `scale(percentage, 0, 1, outMin, outMax)`.
 *
 * If you want to scale some input range to percentage output range, just use `scale`:
 * ```js
 * // Yields 0.5
 * scale(2.5, 0, 5);
 * ```
 * @param percentage Input value, within percentage range
 * @param outMin Output minimum, between 0-1
 * @param outMax Output maximum, between 0-1
 * @returns Scaled value between outMin-outMax.
 */
export const scalePercentages = (
  percentage: number,
  outMin: number,
  outMax = 1
): number => {
  resultThrow(
    numberTest(percentage, `percentage`, `v`),
    numberTest(outMin, `percentage`, `outMin`),
    numberTest(outMax, `percentage`, `outMax`)
  );
  return scale(percentage, 0, 1, outMin, outMax);
};

/**
 * Scales an input percentage value to an output range
 * If you have an input percentage (0-1), `scalePercent` maps it to an output range of `outMin`-`outMax`.
 * ```js
 * scalePercent(0.5, 10, 20); // 15
 * ```
 *
 * @see {@link scalerPercent} Returns a function
 * @param v Value to scale
 * @param outMin Minimum for output
 * @param outMax Maximum for output
 * @returns
 */
export const scalePercent = (
  v: number,
  outMin: number,
  outMax: number
): number => scalerPercent(outMin, outMax)(v);

/**
 * Returns a function that scales an input percentage value to an output range
 * @see {@link scalePercent} Calculates value
 * @param outMin
 * @param outMax
 * @returns Function that takes a single argument
 */
export const scalerPercent = (outMin: number, outMax: number): (v: number) => number => {
  return (v: number) => {
    resultThrow(numberTest(v, `percentage`, `v`));
    return scale(v, 0, 1, outMin, outMax);
  };
};



/**
 * Returns a two-way scaler
 * ```js
 * // Input range 0..100, output range 0..1
 * const s = scalerTwoWay(0,100,0,1);
 * 
 * // Scale from input to output
 * s.out(50); // 0.5
 * 
 * // Scale from output range to input
 * s.in(1); // 100
 * ```
 * @param inMin 
 * @param inMax 
 * @param outMin 
 * @param outMax 
 * @returns 
 */
export const scalerTwoWay = (inMin: number, inMax: number, outMin = 0, outMax = 1, clamped = false, easing?: (v: number) => number): NumberScalerTwoWay => {
  const toOut = scaler(inMin, inMax, outMin, outMax, easing, clamped);
  const toIn = scaler(outMin, outMax, inMin, inMax, easing, clamped);
  return { out: toOut, in: toIn };
}