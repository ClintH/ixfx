import { number as guardNumber} from "../Guards.js";

/**
 * Scales `v` from an input range to an output range (aka `map`)
 * 
 * For example, if a sensor's useful range is 100-500, scale it to a percentage:
 * ```js
 * scale(sensorReading, 100, 500, 0, 1);
 * ```
 * 
 * `scale` defaults to a percentage-range output, so you can get away with:
 * ```js
 * scale(sensorReading, 100, 500);
 * ```
 * 
 * If `v` is outside of the input range, it will likewise be outside of the output range.
 * Use {@link clamp} to ensure output range is maintained.
 * 
 * If inMin and inMax are equal, outMax will be returned.
 * 
 * An easing function can be provided for non-linear scaling. In this case
 * the input value is 'pre scaled' using the function before it is applied to the
 * output range.
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
  v:number, 
  inMin:number, inMax:number, 
  outMin?:number, outMax?:number,
  easing?:(v:number)=>number
):number => {
  if (outMax === undefined) outMax = 1;
  if (outMin === undefined) outMin = 0;
  if (inMin === inMax) return outMax;
  //console.log(`v: ${v} in: ${inMin}-${inMax} out: ${outMin}-${outMax}`);
  //eslint-disable-next-line functional/no-let
  let a = (v - inMin) / (inMax - inMin);
  if (easing !== undefined) a = easing(a);
  return a * (outMax - outMin) + outMin;
  //return (v - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
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
export const scalePercentages = (percentage:number, outMin:number, outMax:number = 1):number => {
  guardNumber(percentage, `percentage`, `v`);
  guardNumber(outMin, `percentage`, `outMin`);
  guardNumber(outMax, `percentage`, `outMax`);
  return scale(percentage, 0, 1, outMin, outMax);
};


/**
 * Scales an input percentage value to an output range
 * If you have an input percentage (0-1), `scalePercent` maps it to an output range of `outMin`-`outMax`.
 * ```js
 * scalePercent(0.5, 10, 20); // 15
 * ```
 * 
 * @param v Value to scale
 * @param outMin Minimum for output
 * @param outMax Maximum for output
 * @returns 
 */
export const scalePercent = (v:number, outMin:number, outMax:number):number => {
  guardNumber(v, `percentage`, `v`);
  return scale(v, 0, 1, outMin, outMax);
};
