import { defaultRandom, type RandomSource } from './Types.js';
import { type EasingName, get as EasingGet } from '../modulation/Easing.js';
/**
 * Options for producing weighted distribution
 */
export type WeightedOptions = Readonly<{
  /**
   * Easing function to use (optional)
   */
  easing?: EasingName;
  /**
   * Random source (optional)
   */
  source?: RandomSource;
}>
/***
 * Returns a random number, 0..1, weighted by a given easing function.
 * Default easing is `quadIn`, which skews towards zero.
 *
 * Use {@link weightedSource} to return a function instead.
 *
 * ```js
 * import * as Random from 'https://unpkg.com/ixfx/dist/random.js';
 * Random.weighted();          // quadIn easing by default, which skews toward low values
 * Random.weighted(`quadOut`); // quadOut favours high values
 * ```
 * @param easingNameOrOpts Options. Uses 'quadIn' by default.
 * @see {@link weightedSource} Returns a function rather than value
 * @returns Random number (0-1)
 */
export const weighted = (
  easingNameOrOptions: EasingName | WeightedOptions = `quadIn`
): number => weightedSource(easingNameOrOptions)();

/***
 * Returns a random number, 0..1, weighted by a given easing function.
 * Default easing is `quadIn`, which skews towards zero.
 * Use {@link weighted} to get a value directly.
 *
 * ```js
 * import * as Random from 'https://unpkg.com/ixfx/dist/random.js';
 * const r1 = Random.weightedSource();          // quadIn easing by default, which skews toward low values
 * r1(); // Produce a value
 *
 * const r2 = Random.weightedSource(`quadOut`); // quadOut favours high values
 * r2(); // Produce a value
 * ```
 * @param easingName Easing name or options `quadIn` by default.
 * @see {@link weighted} Returns value instead of function
 * @returns Function which returns a weighted random value
 */
export const weightedSource = (
  easingNameOrOptions: EasingName | WeightedOptions = `quadIn`
): RandomSource => {
  const options =
    typeof easingNameOrOptions === `string`
      ? { easing: easingNameOrOptions }
      : easingNameOrOptions;
  const source = options.source ?? defaultRandom;
  const easingName = options.easing ?? `quadIn`;
  const easingFunction = EasingGet(easingName);
  if (easingFunction === undefined) {
    throw new Error(`Easing function '${ easingName }' not found.`);
  }

  const compute = (): number => {
    const r = source();
    return easingFunction(r);
  };
  return compute;
};