import type { HasCompletion } from "@ixfx/core";
import type { Tokeniser } from "@ixfx/core/text-tokenise.js";
import type { BasicInterpolateOptions } from "@ixfx/numbers";
import type { EasingName } from './easing.js';
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

export type ModSettableOptions = {
  /**
   * Starting absolute value of source.
   */
  startAt: number;
  /**
   * Starting relative value of source (eg 0.5 for 50%)
   */
  startAtRelative: number;
  /**
   * If set, determines how many cycles. By default unlimited.
   * Use 1 for example for a one-shot wave.
   */
  cycleLimit: number;
  /**
   * Function that returns current time in milliseconds.
   * Defaults to `performance.now`. Useful for testing.
   */
  timeSource: () => number;
};

export type ModSettableFeedback = {
  /**
   * If set, resets absolute position of clock
   */
  resetAt: number;
  /**
   * If set, resets relative position of clock
   */
  resetAtRelative: number;
};

export type ModSettable = (feedback?: Partial<ModSettableFeedback>) => number;

/**
 * A mod source returns numbers on a 0..1 scale.
 * Usually invoked just a function, some sources also support
 * 'feedback' allowing source to be adjusted dynamically.
 *
 * See Modulation.Sources for more.
 */

export type ModSource = (feedback?: any) => number;

/**
 * A function that modulates `v`.
 *
 * Example modulators:
 * {@link wave}: Generate different wave shapes
 * Raw access to waves: {@link arcShape}, {@link sineShape},{@link sineBipolarShape}, {@link triangleShape}, {@link squareShape}
 * {@link Easings}: Easing functions
 * {@link springShape}: Spring
 */
export type ModFunction = (v: number) => number;

export type ModulatorTimed = HasCompletion & {
  /**
   * Computes the current value of the easing
   *
   * @returns {number}
   */
  compute: () => number;

  /**
   * Reset the easing
   */
  reset: () => void;
  /**
   * Returns true if the easing is complete
   *
   * @returns {boolean}
   */
  get isDone(): boolean;
};

export type SpringOptions = Partial<{
  /**
   * How much 'weight' the spring has.
   * Favour adjusting 'damping' or 'stiffness' before changing mass.
   * Default: 1
   */
  readonly mass: number; // = 1.0
  /**
   * Absorbs the energy, acting as a kind of friction. Helps
   * to avoid oscillations where the spring doesn't 'end'
   * Default: 10
   */
  readonly damping: number; // = 10.0
  /**
   * How bouncy the spring is
   * Default: 100
   */
  readonly stiffness: number; // = 100.0
  /**
   * Default: false
   */
  readonly soft: boolean; // = false

  /**
   * Default: 0.1
   */
  readonly velocity: number;

  /**
   * How many iterations to wait for spring settling. Longer values may be
   * needed if it seems the spring gets prematurely cut off.
   * Default: 10
   */
  readonly countdown: number;
}>;