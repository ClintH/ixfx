//import {number as guardNumber} from "../Guards.js";

import * as Timers from '../Timer.js';

/**
 * Oscillator.
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
export function* sine(timer:Timers.Timer) {
  //eslint-disable-next-line functional/no-loop-statement
  while (true) {
    // Rather than -1 to 1, we want 0 to 1
    yield (Math.sin(timer.elapsed*Math.PI*2) + 1) / 2;
  }
}

//eslint-disable-next-line func-style
export function* sineBipolar(timer:Timers.Timer) {
  //eslint-disable-next-line functional/no-loop-statement
  while (true) {
    yield Math.sin(timer.elapsed*Math.PI*2);
  }
}

//eslint-disable-next-line func-style
export function* triangle(timer:Timers.Timer) {
  //eslint-disable-next-line functional/no-loop-statement
  while (true) {
    // elapsed is repeatedly 0->1
    //eslint-disable-next-line functional/no-let
    let v = timer.elapsed; 
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

//eslint-disable-next-line func-style
export function* saw(timer:Timers.Timer) {
  //eslint-disable-next-line functional/no-loop-statement
  while (true) {
    yield timer.elapsed;
  }
}

//eslint-disable-next-line func-style
export function* square(timer:Timers.Timer) {
  //eslint-disable-next-line functional/no-loop-statement
  while (true) {   
    yield (timer.elapsed < 0.5) ? 0 : 1;
  }
}