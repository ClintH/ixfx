import { clamp } from "../data/Clamp.js";
import { type RandomSource, defaultRandom } from "./Types.js";
import type { WeightedOptions } from "./Weighted.js";
import { throwNumberTest } from '../util/GuardNumbers.js';
import { get as EasingGet } from '../modulation/Easing.js';
export type WeightedIntegerOptions = WeightedOptions & Readonly<{
  min?: number;
  max: number;
}>;
/**
 * Random integer, weighted according to an easing function.
 * Number will be inclusive of `min` and below `max`.
 *
 * @example 0..99
 * ```js
 * import * as Random from 'https://unpkg.com/ixfx/dist/random.js';
 * const r = Random.weightedIntegerFn(100);
 * r(); // Produce value
 * ```
 *
 * @example 20..29
 * ```js
 * const r = Random.weightedIntegerFn({ min: 20, max: 30 });
 * r(); // Produce value
 * ```
 *
 * @example  0..99 with 'quadIn' easing
 * ```js
 * const r = Random.weightedInteger({ max: 100, easing: `quadIn` });
 * ```
 *
 * Note: result from easing function will be clamped to
 * the min/max (by default 0-1);
 *
 * @param maxOrOptions Maximum (exclusive)
 * @returns Function that produces a random weighted integer
 */
export const weightedIntegerSource = (
  maxOrOptions: number | WeightedIntegerOptions
): RandomSource => {
  const options = typeof maxOrOptions === `number` ? { max: maxOrOptions } : maxOrOptions;
  const source = options.source ?? defaultRandom;
  const max = options.max;
  const min = options.min ?? 0;
  const easingName = options.easing ?? `quadIn`;
  if (typeof max === `undefined`) throw new Error(`max field is undefined`);
  if (typeof easingName !== `string`) {
    throw new TypeError(`easing field expected to be string`);
  }
  throwNumberTest(max);

  const easingFunction = EasingGet(easingName);
  if (easingFunction === undefined) {
    throw new Error(`Easing '${ easingName }' not found`);
  }

  throwNumberTest(min);
  if (max <= min) throw new Error(`Max should be greater than min`);

  const compute = (): number => {
    const r = clamp(easingFunction(source()));
    return Math.floor(r * (max - min)) + min;
  };
  return compute;
};

/**
 * @example 0..99
 * ```js
 * import * as Random from 'https://unpkg.com/ixfx/dist/random.js';
 * Random.weightedInteger(100);
 * ```
 *
 * @example 20..29
 * ```js
 * Random.weightedInteger({ min: 20, max: 30 });
 * ```
 *
 * @example  0..99 with 'quadIn' easing
 * ```js
 * Random.weightedInteger({ max: 100, easing: `quadIn` })
 * ```
 * @inheritDoc {@link weightedIntegerSource}
 * @param maxOrOptions
 * @returns Random weighted integer
 */
export const weightedInteger = (maxOrOptions: number | WeightedIntegerOptions): number =>
  weightedIntegerSource(maxOrOptions)();