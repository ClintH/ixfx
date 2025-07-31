import { type RandomSource, type WeightedOptions } from './types.js';


/***
 * Returns a random number, 0..1, weighted by a given easing function.
 * See @ixfx/modulation.weighted to use a named easing function.
 * Use {@link weightedSource} to return a function instead.
 *
 * @see {@link weightedSource} Returns a function rather than value
 * @returns Random number (0-1)
 */
export const weighted = (
  options: WeightedOptions
): number => weightedSource(options)();

/***
 * Returns a random number, 0..1, weighted by a given easing function.
 * See @ixfx/modulation.weighted to use a named easing function.
 * Use {@link weighted} to get a value directly.
 *
 * @see {@link weighted} Returns value instead of function
 * @returns Function which returns a weighted random value
 */
export const weightedSource = (
  options: WeightedOptions
): RandomSource => {
  const source = options.source ?? Math.random;
  if (typeof options.easing !== `undefined`) throw new Error(`Param 'easingName' unavailable. Use @ixfx/modulation.weighted instead.`);
  if (typeof options.easingFunction === `undefined`) throw new Error(`Param 'easingFunction' is undefined`);
  return (): number => options.easingFunction(source());
};