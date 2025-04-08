import * as Flow from '@ixfxfun/flow';
const piPi = Math.PI * 2;

/**
 * Sine oscillator.
 *
 * ```js
 * import { Oscillators } from "https://unpkg.com/ixfx/dist/modulation.js"
 * import { frequencyTimer } from "https://unpkg.com/ixfx/dist//flow.js";
 * // Setup
 * const osc = Oscillators.sine(frequencyTimer(10));
 * const osc = Oscillators.sine(0.1);
 *
 * // Call whenever a value is needed
 * const v = osc.next().value;
 * ```
 *
 * @example Saw/tri pinch
 * ```js
 * const v = Math.pow(osc.value, 2);
 * ```
 *
 * @example Saw/tri bulge
 * ```js
 * const v = Math.pow(osc.value, 0.5);
 * ```
 *
 */
//eslint-disable-next-line func-style
export function* sine(timerOrFreq: Flow.Timer | number) {
  if (timerOrFreq === undefined) throw new TypeError(`Parameter 'timerOrFreq' is undefined`);
  if (typeof timerOrFreq === `number`) {
    timerOrFreq = Flow.frequencyTimer(timerOrFreq);
  }

  while (true) {
    // Rather than -1 to 1, we want 0 to 1
    yield (Math.sin(timerOrFreq.elapsed * piPi) + 1) / 2;
  }
}

/**
 * Bipolar sine (-1 to 1)
 * @param timerOrFreq
 */
//eslint-disable-next-line func-style
export function* sineBipolar(timerOrFreq: Flow.Timer | number) {
  if (timerOrFreq === undefined) throw new TypeError(`Parameter 'timerOrFreq' is undefined`);

  if (typeof timerOrFreq === `number`) {
    timerOrFreq = Flow.frequencyTimer(timerOrFreq);
  }
  while (true) {
    yield Math.sin(timerOrFreq.elapsed * piPi);
  }
}

/**
 * Triangle oscillator
 *
 * ```js
 * // Setup
 * const osc = triangle(Timers.frequencyTimer(0.1));
 * const osc = triangle(0.1);
 *
 * // Call whenver a value is needed
 * const v = osc.next().value;
 * ```
 */
//eslint-disable-next-line func-style
export function* triangle(timerOrFreq: Flow.Timer | number) {
  if (typeof timerOrFreq === `number`) {
    timerOrFreq = Flow.frequencyTimer(timerOrFreq);
  }
  while (true) {
    // elapsed is repeatedly 0->1
    //eslint-disable-next-line functional/no-let
    let v = timerOrFreq.elapsed;
    // /2 = 0->0.5
    if (v < 0.5) {
      // Upward
      v *= 2;
    } else {
      // Downward
      v = 2 - v * 2;
    }
    yield v;
  }
}

/**
 * Saw oscillator
 *
 * ```js
 * import { Oscillators } from "https://unpkg.com/ixfx/dist/modulation.js"
 * import { frequencyTimer } from "https://unpkg.com/ixfx/dist//flow.js";
 * // Setup
 * const osc = Oscillators.saw(Timers.frequencyTimer(0.1));
 *
 * // Or
 * const osc = Oscillators.saw(0.1);
 *
 * // Call whenever a value is needed
 * const v = osc.next().value;
 * ```
 */
//eslint-disable-next-line func-style
export function* saw(timerOrFreq: Flow.Timer | number) {
  if (timerOrFreq === undefined) throw new TypeError(`Parameter 'timerOrFreq' is undefined`);

  if (typeof timerOrFreq === `number`) {
    timerOrFreq = Flow.frequencyTimer(timerOrFreq);
  }
  while (true) {
    yield timerOrFreq.elapsed;
  }
}

/**
 * Square oscillator
 *
 * ```js
 * import { Oscillators } from "https://unpkg.com/ixfx/dist/modulation.js"
 *
 * // Setup
 * const osc = Oscillators.square(Timers.frequencyTimer(0.1));
 * const osc = Oscillators.square(0.1);
 *
 * // Call whenever a value is needed
 * osc.next().value;
 * ```
 */
//eslint-disable-next-line func-style
export function* square(timerOrFreq: Flow.Timer | number) {
  if (typeof timerOrFreq === `number`) {
    timerOrFreq = Flow.frequencyTimer(timerOrFreq);
  }
  while (true) {
    yield timerOrFreq.elapsed < 0.5 ? 0 : 1;
  }
}
