import * as Easings from './Easing.js';
import * as Envelopes from './Envelope.js';
import * as Forces from './Forces.js';
import * as Oscillators from './Oscillator.js';
import { type JitterFn, type JitterOpts, jitter } from './Jitter.js';
export { perSecond } from './PerSecond.js';
export * from './PingPong.js';
/**
 * Jitter
 */
export { jitter };

export type { JitterFn, JitterOpts };

/**
 * Easings module
 *
 * [See the guide](https://clinth.github.io/ixfx-docs/modulation/easing/)
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
 * import { Easings } from '../../ixfx/dist/modulation.js';
 * Easings.time(...);
 *
 * // Import from web
 * import { Easings } from 'https://unpkg.com/ixfx/dist/modulation.js'
 * Easings.time(...);
 * ```
 */
export { Easings };

/**
 * Envelope
 */
export * from './Envelope.js';

/**
 * Forces module can help to compute basic physical forces like gravity, friction, springs etc.
 *
 * @example Importing
 * ```js
 * // If library is stored two directories up under `ixfx/`
 * import { Forces } from '../../ixfx/dist/modulation.js';
 * Forces.attractionForce(...);
 *
 * // Import from web
 * import { Forces } from 'https://unpkg.com/ixfx/dist/modulation.js'
 * Forces.attractionForce(...);
 * ```
 *
 */
export { Forces };

/**
 * Oscillators module has waveshapes for producing values with a specified frequency.
 *
 * Overview
 * * {@link Oscillators.saw}: 'Sawtooth' wave
 * * {@link Oscillators.sine}: Sine wave
 * * {@link Oscillators.sineBipolar}: Sine wave with range of -1 to 1
 * * {@link Oscillators.square}: Square wave
 * * {@link Oscillators.triangle}: Triangle wave
 * * {@link Oscillators.spring}: Spring oscillator
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
 * import { Oscillators } from '../../ixfx/dist/modulation.js';
 * Oscillators.saw(...);
 *
 * // Import from web
 * import { Oscillators } from 'https://unpkg.com/ixfx/dist/modulation.js'
 * Oscillators.saw(...);
 * ```
 *
 */
export { Oscillators };

try {
  if (typeof window !== `undefined`) {
    //eslint-disable-next-line functional/immutable-data,@typescript-eslint/no-explicit-any
    (window as any).ixfx = {
      ...(window as any).ixfx,
      Modulation: { Forces, jitter, Envelopes, Oscillators, Easings },
    };
  }
} catch {
  /* no-op */
}
