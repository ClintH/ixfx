import * as TimeSources from './source/time.js';
import type { ModSettable, ModSettableOptions } from './types.js';

export type TimingSources = `elapsed` | `hertz` | `bpm`

/**
 * A factory function for creating a timing source. It returns
 * a function which creates a designated timer.
 * 
 * This is useful in times where you need to recreate timers, eg for reset
 * type of behaviours because the options for the timer to be
 * consolidated in one place.
 * 
 * ```js
 * // Get a factory for an elapsed timer
 * const factory = sources(`elapsed`, 1000);
 * 
 * // Create the timer
 * let t = factory();
 * 
 * // Get a value from the timer
 * const value = t();
 * 
 * // Recreate the timer, note we don't need any options
 * t = factory();
 * ```
 * 
 * @param source Kind of timer to make
 * @param duration Duration depends on the timer used. Will be milliseconds, hertz or bpm.
 * @param options Options to pass to timer.
 * @returns 
 */
export const timingSourceFactory = (source: TimingSources, duration: number, options: Partial<ModSettableOptions> = {}): TimingSourceFactory => {
  switch (source) {
    case `elapsed`:
      return () => TimeSources.elapsed(duration, options)
    case `bpm`:
      return () => TimeSources.bpm(duration, options);
    case `hertz`:
      return () => TimeSources.hertz(duration, options);
    default:
      throw new Error(`Unknown source '${ source }'. Expected: 'elapsed', 'hertz' or 'bpm'`);
  }
}

export type TimingSourceFactory = () => ModSettable