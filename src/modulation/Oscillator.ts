import * as Timers from '../flow/Timer.js';

const piPi = Math.PI*2;

export type SpringOpts = {
  /**
   * Default: 1
   */
	readonly mass?: number; // = 1.0
  /**
   * Default: 10
   */
	readonly damping?: number; // = 10.0
  /**
   * Default: 100
   */
	readonly stiffness?: number; // = 100.0
  /**
   * Default: false
   */
	readonly soft?: boolean; // = false

  /**
   * Default: 0.1
   */
  readonly velocity?:number

  /**
   * How many iterations to wait for spring settling (default: 10)
   */
  readonly countdown?:number
}

const springRaw = (opts: SpringOpts = {}, from: number = 0, to: number = 1) => {
  /** MIT License github.com/pushkine/ */
  const mass = opts.mass ?? 1;
  const stiffness = opts.stiffness ?? 100;
  const soft = opts.soft ?? false;
  const damping = opts.damping ?? 10;
  const velocity = opts.velocity ?? 0.1;
  const delta = to - from;
  if (true === soft || 1.0 <= damping / (2.0 * Math.sqrt(stiffness * mass))) {
    const angularFrequency = -Math.sqrt(stiffness / mass);
    const leftover = -angularFrequency * delta - velocity;
    return (t: number) => to - (delta + t * leftover) * Math.E ** (t * angularFrequency);
  } else {
    const dampingFrequency = Math.sqrt(4.0 * mass * stiffness - damping ** 2.0);
    const leftover = (damping * delta - 2.0 * mass * velocity) / dampingFrequency;
    const dfm = (0.5 * dampingFrequency) / mass;
    const dm = -(0.5 * damping) / mass;
    return (t: number) => to - (Math.cos(t * dfm) * delta + Math.sin(t * dfm) * leftover) * Math.E ** (t * dm);
  }
};

/**
 * Spring-style oscillation
 * 
 * ```js
 * import { Oscillators } from "https://unpkg.com/ixfx/dist/modulation.js"
 * const spring = Oscillators.spring();
 * 
 * continuously(() => {
 *  const v = spring.next().value;
 *  // Yields values 0...1
 *  //  undefined is yielded when spring is estimated to have stopped
 * });
 * ``` 
 * 
 * Parameters to the spring can be provided.
 * ```js
 * const spring = Oscillators.spring({
 *  mass: 5,
 *  damping: 10
 *  stiffness: 100
 * });
 * ```
 * @param opts 
 * @param timerOrFreq 
 */
//eslint-disable-next-line func-style
export function* spring(opts:SpringOpts = {}, timerOrFreq:Timers.Timer|undefined) {
  if (timerOrFreq === undefined) timerOrFreq = Timers.msElapsedTimer();
  
  const fn = springRaw(opts, 0, 1);

  // Give it some iterations to settle
  //eslint-disable-next-line functional/no-let
  let doneCountdown = opts.countdown ?? 10;

  while (doneCountdown > 0) {
    const s = fn(timerOrFreq.elapsed/1000);
    yield s;
    if (s === 1) {
      doneCountdown--;
    } else {
      doneCountdown = 100;
    }
  }
}

/**
 * Sine oscillator.
 * 
 * ```js
 * import { Oscillators } from "https://unpkg.com/ixfx/dist/modulation.js"
 * 
 * // Setup
 * const osc = Oscillators.sine(Timers.frequencyTimer(10));
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
export function* sine(timerOrFreq:Timers.Timer|number) {
  if (typeof timerOrFreq === `number`) timerOrFreq = Timers.frequencyTimer(timerOrFreq);
  
  while (true) {
    // Rather than -1 to 1, we want 0 to 1
    yield (Math.sin(timerOrFreq.elapsed*piPi) + 1) / 2;
  }
}

/**
 * Bipolar sine (-1 to 1)
 * @param timerOrFreq 
 */
//eslint-disable-next-line func-style
export function* sineBipolar(timerOrFreq:Timers.Timer|number) {
  if (typeof timerOrFreq === `number`) timerOrFreq = Timers.frequencyTimer(timerOrFreq);
  while (true) {
    yield Math.sin(timerOrFreq.elapsed*piPi);
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
export function* triangle(timerOrFreq:Timers.Timer|number) {
  if (typeof timerOrFreq === `number`) timerOrFreq = Timers.frequencyTimer(timerOrFreq);
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
 * 
 * ```js
 * import { Oscillators } from "https://unpkg.com/ixfx/dist/modulation.js"
 * 
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
export function* saw(timerOrFreq:Timers.Timer) {
  if (typeof timerOrFreq === `number`) timerOrFreq = Timers.frequencyTimer(timerOrFreq);
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
export function* square(timerOrFreq:Timers.Timer) {
  if (typeof timerOrFreq === `number`) timerOrFreq = Timers.frequencyTimer(timerOrFreq);
  while (true) {   
    yield (timerOrFreq.elapsed < 0.5) ? 0 : 1;
  }
}