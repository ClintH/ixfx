import {RandomSource, defaultRandom} from '../Random.js';
import {clamp} from '../data/Clamp.js';
import {number as guardNumber} from '../Guards.js';
import * as Easings from './Easing.js';

/**
 * Easings module
 * 
 * Overview:
 * * {@link Easings.time}: Ease by time
 * * {@link Easings.tick}: Ease by tick
 * * {@link Easings.get}: Get an easing function by name
 * * {@link Easings.crossfade}: Mix two synchronised easing functions (a slight shortcut over `mix`)
 * * {@link Easings.mix}: Mix two easing functions
 * * {@link Easings.gaussian}: Gaussian distribution (rough bell curve)
 * 
 * @example Importing
 * ```js
 * // If library is stored two directories up under `ixfx/`
 * import {Easings} from '../../ixfx/dist/modulation.js';
 * Easings.time(...);
 * 
 * // Import from web
 * import {Easings} from 'https://unpkg.com/ixfx/dist/modulation.js'
 * Easings.time(...);
 * ```
 */
export {Easings};

/**
 * Envelope
 */
import * as Envelopes from './Envelope.js';
export * from './Envelope.js';

/**
 * Forces module can help to compute basic physical forces like gravity, friction, springs etc.
 * 
 * @example Importing
 * ```js
 * // If library is stored two directories up under `ixfx/`
 * import {Forces} from '../../ixfx/dist/modulation.js';
 * Forces.attractionForce(...);
 * 
 * // Import from web
 * import {Forces} from 'https://unpkg.com/ixfx/dist/modulation.js'
 * Forces.attractionForce(...);
 * ```
 * 
 */
import * as Forces from './Forces.js';
export {Forces};


import * as Oscillators from './Oscillator.js';

/**
 * Oscillators module has waveshapes for producing values with a specified frequency.
 * 
 * Overview
 * * {@link Oscillators.saw}: 'Sawtooth' wave
 * * {@link Oscillators.sine}: Sine wave
 * * {@link Oscillators.sineBipolar}: Sine wave with range of -1 to 1
 * * {@link Oscillators.square}: Square wave
 * * {@link Oscillators.triangle}: Triangle wave
 * 
 * @example On-demand sampling
 * ```js
 * // Saw wave with frequency of 0.10hZ
 * const osc = Oscillators.saw(0.1);
 * 
 * // Whever we need to sample from the oscillator...
 * const v = osc.next().value;
 * ```
 * 
 * @example Importing
 * ```js
 * // If library is stored two directories up under `ixfx/`
 * import {Oscillators} from '../../ixfx/dist/modulation.js';
 * Oscillators.saw(...);
 * 
 * // Import from web
 * import {Oscillators} from 'https://unpkg.com/ixfx/dist/modulation.js'
 * Oscillators.saw(...);
 * ```
 * 
 */
export {Oscillators};

export type JitterOpts = {
  readonly type?: `rel`|`abs`,
  readonly clamped?: boolean,
  readonly random?: RandomSource
}

/**
 * Jitters `value` by the absolute `jitter` amount.
 * All values should be on a 0..1 scale, and the return value is by default clamped to 0..1. 
 * Pass `clamped:false` as an option
 * to allow for arbitary ranges.
 * 
 * ```js
 * import { jitter } from 'https://unpkg.com/ixfx/dist/modulation.js';
 * 
 * // Jitter 0.5 by 10% (absolute)
 * // yields range of 0.4-0.6
 * jitter(0.5, 0.1);
 * 
 * // Jitter 0.5 by 10% (relative, 10% of 0.5)
 * // yields range of 0.45-0.55
 * jitter(0.5, 0.1, { type:`rel` });
 * ```
 * 
 * You can also opt not to clamp values:
 * ```js
 * // Yields range of -1.5 - 1.5
 * jitter(0.5, 1, { clamped:false });
 * ```
 * 
 * A custom source for random numbers can be provided. Eg, use a weighted
 * random number generator:
 * 
 * ```js
 * import {weighted} from 'https://unpkg.com/ixfx/dist/random.js';
 * jitter(0.5, 0.1, { random: weighted };
 * ```
 * 
 * Options
 * * clamped: If false, `value`s out of percentage range can be used and return value may
 *    beyond percentage range. True by default
 * * type: if `rel`, `jitter` is considered to be a percentage relative to `value`
 *         if `abs`, `jitter` is considered to be an absolute value (default)
 * @param value Value to jitter
 * @param jitter Absolute amount to jitter by
 * @param opts Jitter options
 * @returns Jittered value
 */
export const jitter = (value:number, jitter:number, opts:JitterOpts = {}) => {
 
  const type = opts.type ?? `abs`;
  const clamped = opts.clamped ?? true;
  const rand = opts.random ?? defaultRandom;

  guardNumber(value, clamped ? `percentage` : `bipolar`, `value`);
  guardNumber(jitter, clamped ? `percentage` :`bipolar`, `jitter`);

  //eslint-disable-next-line functional/no-let
  let v:number;
  if (type === `rel`) {
    jitter = value * jitter;
    const j = jitter * 2 * rand();
    v = value - jitter + j;
  } else if (type === `abs`) {
    const j = jitter * 2 * rand();
    v = value - jitter + j;
  } else {
    throw new Error(`Unknown jitter type: ${type}.`);
  }
  if (clamped) return clamp(v);
  return v;
};

try {
  if (typeof window !== `undefined`) {
    //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
    (window as any).ixfx = {...(window as any).ixfx, Modulation: {Forces, jitter, Envelopes, Oscillators, Easings}};
  }
} catch { /* no-op */ }