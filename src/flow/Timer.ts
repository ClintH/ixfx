import {clamp} from '../Util.js';
import {HasCompletion} from './index.js';


/**
 * Creates a timer
 */
export type TimerSource = () => Timer;
 
/**
 * A timer instance
 */
export type Timer = {
  reset(): void
  get elapsed(): number
}

export type ModTimer = Timer & {
  mod(amt:number):void
}


export const frequencyTimerSource = (frequency:number):TimerSource => () => frequencyTimer(frequency, msElapsedTimer());

/**
 * Wraps a timer, returning a relative elapsed value.
 * 
 * ```js
 * let t = relativeTimer(1000, msElapsedTimer());
 * ```
 * 
 * @private
 * @param total 
 * @param timer 
 * @param clampValue If true, returned value never exceeds 1.0 
 * @returns 
 */
export const relativeTimer = (total:number, timer: Timer, clampValue = true):ModTimer & HasCompletion => {
  //eslint-disable-next-line functional/no-let
  let done = false;
  //eslint-disable-next-line functional/no-let
  let modAmt = 1;

  return {
    mod(amt:number) {
      modAmt = amt;
    },
    get isDone() {
      return done;
    },
    reset:() => {
      done = false;
      timer.reset();
    },
    get elapsed() {
      //eslint-disable-next-line functional/no-let
      let v = timer.elapsed / (total * modAmt);
      if (clampValue) v = clamp(v);
      if (v >= 1) done = true;
      return v;
    }
  };
};

  
export const frequencyTimer = (frequency:number, timer:Timer = msElapsedTimer()):ModTimer => {
  const cyclesPerSecond = frequency/1000;
  //eslint-disable-next-line functional/no-let
  let modAmt = 1;
  return {
    mod:(amt:number) => {
      modAmt = amt;
    },
    reset:() => {
      timer.reset();
    },
    get elapsed() {
      // Get position in a cycle
      const v = timer.elapsed * (cyclesPerSecond * modAmt);

      // Get fractional part
      const f = v - Math.floor(v);
      if (f < 0) throw new Error(`Unexpected cycle fraction less than 0. Elapsed: ${v} f: ${f}`);
      if (f > 1) throw new Error(`Unexpected cycle fraction more than 1. Elapsed: ${v} f: ${f}`);
      return f;
    }
  };
};

/**
 * A timer that uses clock time
 * @private
 * @returns {Timer}
 */
export const msElapsedTimer = (): Timer => {
  // eslint-disable-next-line functional/no-let
  let start = performance.now();
  return {
    reset: () => {
      start = performance.now();
    },
    get elapsed() {
      return performance.now() - start;
    }
  };
};

/**
 * A timer that progresses with each call
 * @private
 * @returns {Timer}
 */
export const ticksElapsedTimer = (): Timer => {
  // eslint-disable-next-line functional/no-let
  let start = 0;
  return {
    reset: () => {
      start = 0;
    },
    get elapsed() { return start++; }
  };
};
