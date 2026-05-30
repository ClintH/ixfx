import type { Tokeniser } from "@ixfx/core/text-tokenise.js";

import type { AngleDirection } from "@ixfx/geometry/angles.js";
import type { BasicInterpolateOptions } from "@ixfx/numbers";
import type { EasingName } from '../easing.js';
/**
 * Interpolation options.
 *
 * Limit: What to do if interpolation amount exceeds 0..1 range
 * clamp: lock to A & B (inclusive) Default.
 * wrap: wrap from end to start again
 * ignore: allow return values outside of A..B range
 *
 * Easing: name of easing function for non-linear interpolation
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
export type InterpolateOptions = Partial<BasicInterpolateOptions> & {
  easing: EasingName;
};
export type BooleanInterpolateOptions = Partial<InterpolateOptions> & Partial<{ threshold: number }>;

export type CenteredStringInterpolationOptions = Tokeniser;

export type StringInterpolateOptions = Partial<InterpolateOptions> & {
  style: `token` | `centered` | `human`;
  tokenise?: `character` | `word`;
  tokeniser?: Tokeniser;
};

export type AngleInterpolateOptions = Partial<InterpolateOptions> & {
  /**
   * How to interpolate between angles. Default is `short`, which means the shortest path between angles is taken.
   * `cw` means always interpolate in a clockwise direction, `ccw` means always interpolate in a counter-clockwise direction.
   */
  direction?: AngleDirection;
};