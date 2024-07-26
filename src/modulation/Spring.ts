import * as Timers from '../flow/Timer.js';
import type { EaseValue } from './easing/Types.js';
import type { SpringOptions } from './Types.js';
import { spring as springFn } from './easing/Factories.js';

/**
 * Produces values according to rough spring physics.
 * ```js
 * import { spring } from "https://unpkg.com/ixfx/dist/modulation.js"
 * const s = spring();
 *
 * continuously(() => {
 *  const v = s.next().value;
 *  // Yields values 0...1
 *  //  Will be _undefined_ when spring is estimated to have stopped
 * });
 * ```
 *
 * Parameters to the spring can be provided.
 * ```js
 * const s = spring({
 *  mass: 5,
 *  damping: 10
 *  stiffness: 100
 * });
 * ```
 * 
 * If you don't want to use a generator: {@link springValue}
 * @param opts Options for spring
 * @param timerOrFreq Timer to use, or frequency
 */
export function* spring(
  opts: SpringOptions = {},
  timerOrFreq?: Timers.Timer | number | undefined
) {
  if (timerOrFreq === undefined) timerOrFreq = Timers.elapsedMillisecondsAbsolute();
  else if (typeof timerOrFreq === `number`) {
    timerOrFreq = Timers.frequencyTimer(timerOrFreq);
  }

  const fn = springFn(opts);

  // Give it some iterations to settle
  let doneCountdown = opts.countdown ?? 10;

  while (doneCountdown > 0) {
    const s = fn(timerOrFreq.elapsed / 1000);
    yield s;
    if (s === 1) {
      doneCountdown--;
    } else {
      doneCountdown = 100;
    }
  }
}

/**
 * The same as {@link spring} but instead of a generator we get
 * a value. When the spring is done, 1 is returned instead of undefined.
 * 
 * ```js
 * const s = springValue();
 * s(); // 0..1 (roughly - exceeding 1 is possible)
 * ```
 * @param opts 
 * @param timerOrFreq 
 * @returns 
 */
export function springValue(opts: SpringOptions = {},
  timerOrFreq?: Timers.Timer | number | undefined) {
  const s = spring(opts, timerOrFreq);
  return () => {
    const v = s.next();
    if (v.done) return 1;
    return v.value;
  }
}