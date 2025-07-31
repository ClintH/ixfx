import * as Flow from '@ixfx/flow';
import type { ModFunction, SpringOptions } from './types.js';

/**
 * Produces values according to rough spring physics.
 * å
 * ```js
 * import { continuously } from "@ixfx/flow.js"
 * import { spring } from "@ixfx/modulation.js"
 * 
 * const s = spring();
 *
 * continuously(() => {
 *  const result = s.next();
 *  if (result.done) return false; // Exit loop
 *  const value = result.value;
 *  // Value is mostly within 0..1 range but will exceed these limits
 * }, 10).start();
 * ```
 *
 * Parameters to the spring can be provided.
 * ```js
 * import { spring } from "@ixfx/modulation.js"
 * const s = spring({
 *  mass: 5,
 *  damping: 10
 *  stiffness: 100
 * });
 * ```
 * 
 * If you don't want to use a generator: {@link springValue}.
 * 
 * Note that the generated value can exceed 0..1 range. This is by design, since
 * a spring can 'overshoot'. See Data.Normalise for functions to normalise.
 * 
 * @param opts Options for spring
 * @param timerOrFreq Timer to use, or frequency
 */
export function* spring(
  opts: SpringOptions = {},
  timerOrFreq?: Flow.Timer | number
) {
  if (timerOrFreq === undefined) timerOrFreq = Flow.elapsedMillisecondsAbsolute();
  else if (typeof timerOrFreq === `number`) {
    timerOrFreq = Flow.frequencyTimer(timerOrFreq);
  }

  const fn = springShape(opts);

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
 * import { springValue } from "@ixfx/modulation.js"
 * const s = springValue();
 * s(); // 0..1 (roughly - exceeding 1 is possible)
 * ```
 * 
 * Options can be provided:
 * ```js
 * import { spring } from "@ixfx/modulation.js"
 * const s = springValue({
 *  stiffness: 100,
 *  damping: 10
 * })
 * ```
 * @example Applied
 * ```js
 * import { Modulation, Data } from  "@ixfx/bundle.js"
 * let state = {
 *  spring: Modulation.springValue()
 * }
 * 
 * function loop() {
 *  const d = Data.resolveFields(state);
 * 
 *  // Apply calculated spring value to compute x value
 *  const x = window.innerWidth * d.spring;
 * 
 *  
 *  window.requestAnimationFrame(loop);
 * }
 * loop();
 * ```
 * Note that the generated value can exceed 0..1 range. This is by design, since
 * a spring can 'overshoot'. See Data.Normalise for functions to normalise.
 * 
 * @param opts 
 * @param timerOrFreq 
 * @returns 
 */
export function springValue(opts: SpringOptions = {},
  timerOrFreq?: Flow.Timer | number) {
  const s = spring(opts, timerOrFreq);
  return () => {
    const v = s.next();
    if (v.done) return 1;
    return v.value;
  }
}

/**
 * Spring-dynamics modulator.
 * To have spring driven by time or ticks, use {@link spring} or {@link springValue}.
 * This is a lower-level function.
 * @param opts 
 * @returns 
 */
export const springShape = (opts: SpringOptions = {}): ModFunction => {
  /** MIT License github.com/pushkine/ */
  const from = 0;
  const to = 1;
  const mass = opts.mass ?? 1;
  const stiffness = opts.stiffness ?? 100;
  const soft = opts.soft ?? false;
  const damping = opts.damping ?? 10;
  const velocity = opts.velocity ?? 0.1;
  const delta = to - from;
  if (soft || 1 <= damping / (2 * Math.sqrt(stiffness * mass))) {
    const angularFrequency = -Math.sqrt(stiffness / mass);
    const leftover = -angularFrequency * delta - velocity;
    return (t: number) =>
      to - (delta + t * leftover) * Math.E ** (t * angularFrequency);
  } else {
    const dampingFrequency = Math.sqrt(4 * mass * stiffness - damping ** 2);
    const leftover =
      (damping * delta - 2 * mass * velocity) / dampingFrequency;
    const dfm = (0.5 * dampingFrequency) / mass;
    const dm = -(0.5 * damping) / mass;
    return (t: number) =>
      to -
      (Math.cos(t * dfm) * delta + Math.sin(t * dfm) * leftover) *
      Math.E ** (t * dm);
  }
};