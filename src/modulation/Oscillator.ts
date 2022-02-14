//import {number as guardNumber} from "../Guards.js";

import * as Timers from '../flow/Timer.js';

/**
 * Sine oscillator.
 * 
 * ```js
 * const osc = sine(Timers.frequencyTimer(10));
 * const osc = sine(0.1);
 * osc.next().value;
 * ```
 * 
 * // Saw/tri pinch
 * ```js
 * const v = Math.pow(osc.value, 2);
 * ```
 * 
 * // Saw/tri bulge
 * ```js
 * const v = Math.pow(osc.value, 0.5);
 * ```
 * 
 */
//eslint-disable-next-line func-style
export function* sine(timerOrFreq:Timers.Timer|number) {
  if (typeof timerOrFreq === `number`) timerOrFreq = Timers.frequencyTimer(timerOrFreq);
  
  //eslint-disable-next-line functional/no-loop-statement
  while (true) {
    // Rather than -1 to 1, we want 0 to 1
    yield (Math.sin(timerOrFreq.elapsed*Math.PI*2) + 1) / 2;
  }
}

/**
 * Bipolar sine (-1 to 1)
 * @param timerOrFreq 
 */
//eslint-disable-next-line func-style
export function* sineBipolar(timerOrFreq:Timers.Timer|number) {
  if (typeof timerOrFreq === `number`) timerOrFreq = Timers.frequencyTimer(timerOrFreq);
  //eslint-disable-next-line functional/no-loop-statement
  while (true) {
    yield Math.sin(timerOrFreq.elapsed*Math.PI*2);
  }
}

/**
 * Triangle oscillator
 * ```js
 * const osc = triangle(Timers.frequencyTimer(0.1));
 * const osc = triangle(0.1);
 * osc.next().value;
 * ```
 */
//eslint-disable-next-line func-style
export function* triangle(timerOrFreq:Timers.Timer|number) {
  if (typeof timerOrFreq === `number`) timerOrFreq = Timers.frequencyTimer(timerOrFreq);
  //eslint-disable-next-line functional/no-loop-statement
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
      v = 2 - v*2;
    }
    yield v;
  }
}

/**
 * Saw oscillator
 * ```js
 * const osc = saw(Timers.frequencyTimer(0.1));
 * const osc = saw(0.1);
 * osc.next().value;
 * ```
 */
//eslint-disable-next-line func-style
export function* saw(timerOrFreq:Timers.Timer) {
  if (typeof timerOrFreq === `number`) timerOrFreq = Timers.frequencyTimer(timerOrFreq);
  //eslint-disable-next-line functional/no-loop-statement
  while (true) {
    yield timerOrFreq.elapsed;
  }
}

/**
 * Square oscillator
 * ```js
 * const osc = square(Timers.frequencyTimer(0.1));
 * const osc = square(0.1);
 * osc.next().value;
 * ```
 */
//eslint-disable-next-line func-style
export function* square(timerOrFreq:Timers.Timer) {
  if (typeof timerOrFreq === `number`) timerOrFreq = Timers.frequencyTimer(timerOrFreq);
  //eslint-disable-next-line functional/no-loop-statement
  while (true) {   
    yield (timerOrFreq.elapsed < 0.5) ? 0 : 1;
  }
}