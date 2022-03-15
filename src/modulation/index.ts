import {RandomSource, defaultRandom} from '~/Random.js';
import {clamp} from '~/Util.js';
import {number as guardNumber} from '../Guards.js';

/**
 * Easings module
 * 
 * Overview:
 * * {@link Easings.time} - Ease by time
 * * {@link Easings.tick} - Ease by tick
 * * {@link Easings.get}  - Get an easing function by name
 */
export * as Easings from './Easing.js';

/**
 * Envelope
 */
export * from './Envelope.js';

/**
 * Oscillator
 */
export * as Oscillators from './Oscillator.js';

export type JitterOpts = {
  readonly type?: `rel`|`abs`,
  readonly clamped?: boolean
}

/**
 * Jitters `value` by the absolute `jitter` amount.
 * All values should be on a 0..1 scale, and return value by default clamped to 0..1
 * 
 * ```js
 * // Jitter 0.5 by 10% (absolute)
 * // yields range of 0.4-0.6
 * jitter(0.5, 0.1);
 * 
 * // Jitter 0.5 by 10% (relative)
 * // yields range of 0.45-0.55
 * jitter(0.5, 0.1, {type:`rel`});
 * ```
 * 
 * You can also opt not to clamp values:
 * ```js
 * // Yields range of -1.5 - 1.5
 * jitter(0.5, 1, {clamped:false});
 * ```
 * 
 * A custom source for random numbers can be provided. Eg, use a weighted
 * random number generator:
 * 
 * ```js
 * import {weighted} from 'https://unpkg.com/ixfx/dist/random.js';
 * jitter(0.5, 0.1, {}, weighted);
 * ```
 * @param value Value to jitter
 * @param jitter Absolute amount to jitter by
 * @param opts Jitter options
 * @param rand Source of random numbers, Math.random by default.
 * @returns Jittered value
 */
export const jitter = (value:number, jitter:number, opts:JitterOpts = {}, rand:RandomSource = defaultRandom) => {
 
  const type = opts.type ?? `abs`;
  const clamped = opts.clamped ?? true;

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