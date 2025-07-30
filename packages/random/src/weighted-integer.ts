import { type RandomSource, type WeightedOptions } from "./types.js";
import { clamp } from "./util/clamp.js";
/**
 * Random integer, weighted according to an easing function.
 * Number will be inclusive of `min` and below `max`.
 *
 * @example 0..99
 * ```js
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
 * @param options Options. By default { max:1, min: 0 }
 * @returns Function that produces a random weighted integer
 */
export const weightedIntegerSource = (
  options: WeightedOptions
): RandomSource => {

  const source = options.source ?? Math.random;
  if (typeof options.easingFunction === `undefined`) throw new Error(`Param 'easingFunction' is undefined`);

  const max = options.max ?? 1;
  const min = options.min ?? 0;

  if (max === min) throw new Error(`Param 'max' is the same as  'min'`);
  if (max < min) throw new Error(`Param 'max' should be greater than  'min'`);

  const compute = (): number => {
    const r = clamp(options.easingFunction(source()));
    return Math.floor(r * (max - min)) + min;
  };
  return compute;
};

/**
 * Generate a weighted-random integer.
 * 
 * @example 0..99
 * ```js
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
 * @param options Options. Default: { max: 1, min: 0 }
 * @returns Random weighted integer
 */
export const weightedInteger = (options: WeightedOptions): number =>
  weightedIntegerSource(options)();