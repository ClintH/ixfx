import { resultThrow, integerTest } from "@ixfx/guards";
import type { ModSettable as ModuleSettable, ModSettableFeedback as ModuleSettableFeedback, ModSettableOptions as ModuleSettableOptions, ModulationFunction } from "./types.js";
import * as Sources from './source/index.js';
export type WaveModulator = (feedback?: Partial<WaveShaperFeedback>) => number;

export type Waveforms = `sine` | `sine-bipolar` | `saw` | `triangle` | `square` | `arc`;
/**
 * Options for the wave function. Defaults to a sine wave of one cycle per-second.
 */
export type WaveOptions = ModuleSettableOptions & {
  period: number
  /**
   * Clock source. Set this or ticks, hertz, secs or millis
   * @returns 
   */
  source: () => number,
  /**
   * Waveshape. Default 'sine'
   */
  shape: Waveforms
  /**
   * Number of ticks per cycle
   * (Set either ticks, hertz, secs or millis)
   */
  ticks: number
  /**
   * Number of cycles per second
   * (Set either ticks, hertz, secs or millis)
   */
  hertz: number
  /**
   * Number of seconds per cycle. Defaults to one second.
   * (Set either ticks, hertz, secs or millis)
   */
  secs: number
  /**
   * Number of milliseconds per cycle
   * (Set either ticks, hertz, secs or millis)
   */
  millis: number
  /**
   * If _true_, shape is inverted
   */
  invert: boolean
}
/**
 * Returns a function that shapes a 0..1 value as a 
 * triangle waveform.
 * 
 * No bounds checks are performed on input value.
 * Ensure it is 0..1 (inclusive).
 * @param period 
 * @returns 
 */
export function triangleShape(period = 1): ModulationFunction {
  period = 1 / period;
  const halfPeriod = period / 2;
  return (t: number) => {
    const v = Math.abs((t % period) - halfPeriod);
    //console.log(`t: ${ t.toFixed(2) } v: ${ v.toFixed(2) }`);
    return v;
  }
}

/**
 * Returns a function that shapes a 0..1 value as a square waveform.
 * `period` sets the number of cycles in the 0..1 range.
 * No bounds checks are performed on input value.
 * Ensure it is 0..1 (inclusive).
 * @param period 
 * @returns 
 */
export function squareShape(period = 1): ModulationFunction {
  period = 1 / period;
  const halfPeriod = period / 2;
  return (t: number) => {
    return (t % period) < halfPeriod ? 1 : 0;
    //console.log(`square: ${ t } v: ${ v }`);
    //return v;
  }
}

/**
 * Returns a function that shapes a 0..1 value as a sine waveform.
 * ```js
 * const s = sineShape();
 * // Calculate value of sine wave at 50%
 * // By default there is one oscillation, thus
 * // it will be the middle of the cycle.
 * s(0.5); 
 * ```
 * 
 * The `period` determines number of cycles for
 * an input value of 1.
 * ```js
 * // Oscillate twice in 0..1 range
 * const s = sineShape(2);
 * ```
 * 
 * No bounds checks are performed on input value.
 * Ensure it is 0..1 (inclusive).
 * @param period 
 * @returns 
 */
export function sineShape(period = 1): ModulationFunction {
  period = period * (Math.PI * 2);
  return (t: number) => {
    const v = (Math.sin(t * period) + 1) / 2;
    //console.log(`t: ${ t.toFixed(2) } v: ${ v.toFixed(2) }`);
    return v;
  }
}

/**
 * A series of arcs, sort of like a bouncing ball.
 * @param period 
 * @returns 
 */
export function arcShape(period = 1): ModulationFunction {
  period = period * (Math.PI * 2);
  return (t: number) => Math.abs(Math.sin(t * period));
}

export function sineBipolarShape(period = 1): ModulationFunction {
  period = period * (Math.PI * 2);
  return (t: number) => Math.sin(t * period);
}

/**
 * Creates a wave modulator. Defaults to 5-second sine wave. 
 * ```js
 * import { wave } from 'https://unpkg.com/ixfx/dist/modulation.js';
 * // Triangle wave that has a single cycle over two seconds
 * const m = wave({ secs: 2, shape: `triangle`});
 * 
 * // Call m() to get current value of wave, eg in
 * // an animation loop
 * const v = m();
 * ```
 * 
 * @example
 * ```js
 * import { wave } from 'https://unpkg.com/ixfx/dist/modulation.js';
 * import { resolveFields } from 'https://unpkg.com/ixfx/dist/data.js';
 * 
 * const state = {
 *  intensity: wave({secs: 2, shape: `sine` }),
 *  someOtherState: 10
 * }
 * 
 * const use = async () {
 *  const { intensity } = await resolveFields(state);
 *  // Do something with intensity value...
 * }
 * ```
 * @param options 
 * @returns 
 */
export function wave(options: Partial<WaveOptions>) {
  const shape = options.shape ?? `sine`;
  const invert = options.invert ?? false;
  const period = options.period ?? 1;
  let sourceFunction;

  resultThrow(integerTest(period, `aboveZero`, `period`));

  const sourceOptions = {
    ...options
  }
  if (options.ticks) {
    sourceFunction = Sources.ticks(options.ticks, sourceOptions);
  } else if (options.hertz) {
    sourceFunction = Sources.hertz(options.hertz, sourceOptions);
  } else if (options.millis) {
    sourceFunction = Sources.elapsed(options.millis, sourceOptions);
  } else if (options.source) {
    sourceFunction = options.source;
  } else {
    const secs = options.secs ?? 5;
    sourceFunction = Sources.elapsed(secs * 1000, sourceOptions);
  }

  let shaperFunction;
  switch (shape) {
    case `saw`:
      shaperFunction = (v: number) => v;
      break;
    case `sine`:
      shaperFunction = sineShape(period);
      break;
    case `sine-bipolar`:
      shaperFunction = sineBipolarShape(period);
      break;
    case `square`:
      shaperFunction = squareShape(period);
      break;
    case `triangle`:
      shaperFunction = triangleShape(period);
      break;
    case `arc`:
      shaperFunction = arcShape(period);
      break;
    default:
      throw new Error(`Unknown wave shape '${ shape }'. Expected: sine, sine-bipolar, saw, triangle, arc or square`);
  }
  return waveFromSource(sourceFunction, shaperFunction, invert);
}

/**
 * Wave shaper feedback.
 * Feedback allows you to dynamically control tempo for advanced uses.
 */
export type WaveShaperFeedback = {
  /**
   * Data to feedback to clock source
   */
  clock: ModuleSettableFeedback
  /**
   * If set, source function is ignored and this value (0..1) is used instead
   */
  override: number
}
/**
 * Returns a wave-shaping modulator from a source and shaper
 * @param sourceFn 
 * @param shaperFn 
 * @returns 
 */
export function waveFromSource(sourceFunction: ModuleSettable, shaperFunction: ModulationFunction, invert = false): WaveModulator {
  return (feedback?: Partial<WaveShaperFeedback>) => {
    let v = sourceFunction(feedback?.clock);
    if (feedback?.override) v = feedback.override;
    v = shaperFunction(v);
    if (invert) v = 1 - v;
    return v;
  }
}

