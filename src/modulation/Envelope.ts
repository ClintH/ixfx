import {SimpleEventEmitter} from "../Events.js";
import {  msElapsedTimer, sleep, TimerSource} from "../flow/index.js";
import { Timer } from "../flow/Timer.js";
import { StateMachine } from "../flow/StateMachine.js";
import {Path} from "../geometry/Path.js";
import * as Bezier from '../geometry/Bezier.js';
import {scale} from "../data/Scale.js";

/**
 * @returns Returns a full set of default ADSR options
 */
export const defaultAdsrOpts = ():EnvelopeOpts => ({
  attackBend: -1,
  decayBend: -.3,
  releaseBend: -.3,
  peakLevel: 1,
  initialLevel: 0,
  sustainLevel: 0.6,
  releaseLevel: 0,
  attackDuration: 600,
  decayDuration: 200,
  releaseDuration: 800,
  shouldLoop: false
});

export type EnvelopeOpts = AdsrOpts & AdsrTimingOpts;
/**
 * Options for the ADSR envelope. 
 * 
 * Use {@link defaultAdsrOpts} to get an initial default:
 * @example
 * ```js
 * let env = adsr({
 *  ...defaultAdsrOpts(),
 *  attackDuration: 2000,
 *  releaseDuration: 5000,
 *  sustainLevel: 1,
 *  retrigger: false
 * });
 * ```
 */
export type AdsrOpts = {
  /**
   * Attack bezier 'bend'. Bend from -1 to 1. 0 for a straight line
   */
   readonly attackBend: number
  /**
   * Decay bezier 'bend'. Bend from -1 to 1. 0 for a straight line
   */
   readonly decayBend: number
  /**
   * Release bezier 'bend'. Bend from -1 to 1. 0 for a straight line
   */
   readonly releaseBend: number

   /**
    * Peak level (maximum of attack stage)
    */
   readonly peakLevel:number

  /**
   * Starting level (usually 0)
   */
   readonly initialLevel?:number
/**
 * Sustain level. Only valid if trigger and hold happens
 */ 
   readonly sustainLevel:number
/**
 * Release level, when envelope is done (usually 0)
 */
   readonly releaseLevel?:number

  /**
   * When _false_, envelope starts from it's current level when being triggered.
   * _True_ by default.
   */
  readonly retrigger?: boolean
}

export type AdsrTimingOpts = {
  /**
   * If true, envelope indefinately returns to attack stage after release
   *
   * @type {boolean}
   */
  readonly shouldLoop: boolean

  /**
   * Duration for attack stage
   * Unit depends on timer source
   * @type {number}
   */
  readonly attackDuration: number
  /**
   * Duration for decay stage
   * Unit depends on timer source
   * @type {number}
   */
  readonly decayDuration: number
  /**
   * Duration for release stage
   * Unit depends on timer source
   * @type {number}
   */
  readonly releaseDuration: number
}

/**
 * State change event
 */
export interface StateChangeEvent {
  readonly newState: string,
  readonly priorState: string
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CompleteEvent { /* no-op */}

export type Events = {
  readonly change: StateChangeEvent
  readonly complete: CompleteEvent
};

class AdsrBase extends SimpleEventEmitter<Events> {
  readonly #sm:StateMachine;
  readonly #timeSource:TimerSource;
  #timer:Timer|undefined;

  #holding:boolean;
  #holdingInitial:boolean;

  attackDuration:number;
  decayDuration:number;
  releaseDuration:number;
  decayDurationTotal:number;
  shouldLoop:boolean;

  constructor(opts:AdsrTimingOpts) {
    super();
    
    this.attackDuration = opts.attackDuration ?? 300;
    this.decayDuration = opts.decayDuration ?? 500;
    this.releaseDuration = opts.releaseDuration ?? 1000;
    this.shouldLoop = opts.shouldLoop ?? false;

    const descr ={
      attack: [`decay`, `release`],
      decay: [`sustain`, `release`],
      sustain: [`release`],
      release: [`complete`],
      complete: null
    };
    
    this.#sm = new StateMachine(`attack`, descr);
    this.#sm.addEventListener(`change`, (ev => {
      // Reset timer on release
      if (ev.newState === `release` && this.#holdingInitial) {
        this.#timer?.reset();
      }
      super.fireEvent(`change`, ev);
    }));
    this.#sm.addEventListener(`stop`, (ev => {
      super.fireEvent(`complete`, ev);
    }));
    
    this.#timeSource = msElapsedTimer;
    this.#holding = this.#holdingInitial = false;

    this.decayDurationTotal = this.attackDuration + this.decayDuration;
  }

  protected switchState():boolean {
    if (this.#timer === undefined) return false;
    // eslint-disable-next-line functional/no-let
    let elapsed = this.#timer.elapsed;
    const wasHeld = this.#holdingInitial && !this.#holding;

    // Change through states for as long as needed
    // eslint-disable-next-line functional/no-let
    let hasChanged = false;
    // eslint-disable-next-line functional/no-loop-statement
    do {
      hasChanged = false;
      switch (this.#sm.state) {
      case `attack`:
        if (elapsed > this.attackDuration || wasHeld) {
          this.#sm.next();
          hasChanged = true;
        }
        break;
      case `decay`:
        if (elapsed > this.decayDurationTotal || wasHeld) {
          this.#sm.next();
          hasChanged = true;
        }
        break;
      case `sustain`:
        if (!this.#holding || wasHeld) {
          elapsed = 0;
          this.#sm.next();
          this.#timer?.reset();
          hasChanged = true;
        }
        break;
      case `release`:
        if (elapsed > this.releaseDuration) {
          this.#sm.next();
          hasChanged = true;
        }
        break;
      case `complete`:
        if (this.shouldLoop) {
          this.trigger(this.#holdingInitial);
        }
      }
    } while (hasChanged);
    return hasChanged;
  }

  /**
   * Computes a stage progress from 0-1
   * @param allowStateChange 
   * @returns 
   */
  protected computeRaw(allowStateChange = true):[stage:string|undefined, amount:number, prevStage:string] {
    if (this.#timer === undefined) return [undefined, 0, this.#sm.state];
  
    // Change state if necessary based on elapsed time
    if (allowStateChange) this.switchState();
    
    const prevStage = this.#sm.state;

    const elapsed = this.#timer.elapsed;
    // eslint-disable-next-line functional/no-let
    let relative = 0;
    const state = this.#sm.state;
    switch (state) {
    case `attack`:
      relative = elapsed / this.attackDuration;
      break;
    case `decay`:
      relative = (elapsed - this.attackDuration) / this.decayDuration;
      break;
    case `sustain`:
      relative = 1;
      break;
    case `release`:
      relative = Math.min(elapsed / this.releaseDuration, 1);
      break;
    case `complete`:
      return [undefined, 1, prevStage];
    default:
      throw new Error(`State machine in unknown state: ${state}`);
    }
    return [state, relative, prevStage];
  }

  get isDone():boolean {
    return this.#sm.isDone;
  }

  onTrigger():void {
    /* no op */
  }

  trigger(hold:boolean = false) {
    this.onTrigger();

    this.#sm.reset();
    this.#timer = this.#timeSource();
    this.#holding = hold;
    this.#holdingInitial = hold;
  }

  compute(): void {
    /* no-op */
  }

  release() {
    if (this.isDone || !this.#holdingInitial) return; // Was never holding or done
  
    // Setting holding flag to false, computeRaw will change state
    this.#holding = false;
    this.compute();
  }
}

/**
 * ADSR (Attack Decay Sustain Release) envelope. An envelope is a value that changes over time,
 * usually in response to an intial trigger.
 * 
 * Created with the {@link adsr} function.
 * 
 * @example Setup
 * ```js
 * import {adsr, defaultAdsrOpts} from 'https://unpkg.com/ixfx/dist/modulation.js'
 * const opts = {
 *  ...defaultAdsrOpts(),
 *  attackDuration: 1000,
 *  decayDuration: 200,
 *  sustainDuration: 100
 * }
 * const env = adsr(opts);
 * ```
 * 
 * @example Using
 * ```js
 * env.trigger(); // Start envelope
 * ...
 * // Get current value of envelope
 * const [state, scaled, raw] = env.compute();
 * ```
 * 
 * * `state` is a string, one of the following: 'attack', 'decay', 'sustain', 'release', 'complete' 
 * * `scaled` is a value scaled according to the stage's _levels_
 * * `raw` is the progress from 0 to 1 within a stage. ie. 0.5 means we're halfway through a stage.
 * 
 * Instead of `compute()`, most usage of the envelope is just fetching the `value` property, which returns the same scaled value of `compute()`:
 * 
 * ```js
 * const value = env.value; // Get scaled number
 * ```
 * 
 * @example Hold & release
 * ```js
 * env.trigger(true);   // Pass in true to hold
 * ...envelope will stop at sustain stage...
 * env.release();      // Release into decay
 * ```
 * 
 * Check if it's done:
 * 
 * ```js
 * env.isDone; // True if envelope is completed
 * ```
 * 
 * Envelope has events to track activity: 'change' and 'complete':
 * 
 * ```
 * env.addEventListener(`change`, ev => {
 *  console.log(`Old: ${evt.oldState} new: ${ev.newState}`);
 * })
 * ```
 */
export interface Adsr extends SimpleEventEmitter<Events> {
  /**
   * Compute value of envelope at this point in time.
   * 
   * Returns an array of [stage, scaled, raw]. Most likely you want to use {@link value} to just get the scaled value.
   * @param allowStateChange If true (default) envelope will be allowed to change state if necessary before returning value
   */
  //eslint-disable-next-line functional/no-method-signature
  compute(allowStateChange?:boolean):readonly [stage:string|undefined, scaled:number, raw:number]

  /**
   * Returns the scaled value
   * Same as .compute()[1]
   */
  get value():number;
 /**
  * Releases a held envelope. Has no effect if envelope was not held or is complete.
  */
  //eslint-disable-next-line functional/no-method-signature
  release():void
  /**
   * Triggers envelope.
   * 
   * If event is already trigged,
   * it will be _retriggered_. If`opts.retriggered` is false (default)
   * envelope starts again at `opts.initialValue`. Otherwise it starts at
   * the current value.
   * 
   * @param hold If _true_ envelope will hold at sustain stage
   */
  //eslint-disable-next-line functional/no-method-signature
  trigger(hold?:boolean):void
  /** 
   * _True_ if envelope is completed
   */
  //eslint-disable-next-line functional/no-method-signature
  get isDone():boolean;
}

class AdsrImpl extends AdsrBase implements Adsr {
  readonly attackPath:Path;
  readonly decayPath:Path;
  readonly releasePath:Path;

  readonly initialLevel;
  readonly peakLevel;
  readonly releaseLevel;
  readonly sustainLevel;

  readonly attackBend;
  readonly decayBend;
  readonly releaseBend;

  protected initialLevelOverride:number|undefined;
  readonly retrigger:boolean;
  private releasedAt:number|undefined;

  constructor(opts:EnvelopeOpts) {
    super(opts);
    this.initialLevel = opts.initialLevel ?? 0;
    this.peakLevel = opts.peakLevel ?? 1;
    this.releaseLevel = opts.releaseLevel ?? 0;
    this.sustainLevel = opts.sustainLevel ?? 0.75;
    this.retrigger = opts.retrigger ?? true;
    
    this.attackBend = opts.attackBend ?? 0;
    this.releaseBend = opts.releaseBend ?? 0;
    this.decayBend = opts.decayBend ?? 0;
    
    const max = 1;
    this.attackPath = Bezier.toPath(Bezier.quadraticSimple(
      {x: 0, y: this.initialLevel}, 
      {x: max, y: this.peakLevel}, 
      -this.attackBend
    ));
    this.decayPath = Bezier.toPath(Bezier.quadraticSimple(
      {x: 0, y: this.peakLevel}, 
      {x: max, y: this.sustainLevel}, 
      -this.decayBend
    ));
    this.releasePath = Bezier.toPath(Bezier.quadraticSimple(
      {x: 0, y: this.sustainLevel},
      {x: max, y: this.releaseLevel}, 
      -this.releaseBend
    ));
  }

  onTrigger() {
    this.initialLevelOverride = undefined;
    if (!this.retrigger) {      
      const [_stage, scaled, _raw] = this.compute();
      if (!Number.isNaN(scaled) && scaled > 0) {
        //console.log(`Retrigger. Last value was: ${scaled}`);
        this.initialLevelOverride = scaled;
      }
    }
  }

  get value():number {
    return this.compute(true)[1];
  }

  compute(allowStateChange = true):[stage:string|undefined, scaled:number, raw:number] {
    const [stage, amt] = super.computeRaw(allowStateChange);
    if (stage === undefined) return [undefined, NaN, NaN];
    // eslint-disable-next-line functional/no-let
    let v;
    switch (stage) {
    case `attack`:
      v = this.attackPath.interpolate(amt).y;
      if (this.initialLevelOverride !== undefined) {
        v = scale(v, 0, 1, this.initialLevelOverride, 1);
      }
      this.releasedAt = v;
      break;
    case `decay`:
      v = this.decayPath.interpolate(amt).y;
      this.releasedAt = v;
      break;
    case `sustain`:
      v = this.sustainLevel;
      this.releasedAt = v;
      break;
    case `release`:
      v = this.releasePath.interpolate(amt).y;
      // Bound release level to the amp level that we released at.
      // ie. when release happens before a stage completes
      if (this.releasedAt !== undefined) v = scale(v, 0, this.sustainLevel, 0, this.releasedAt);
      break;
    case `complete`:
      v = this.releaseLevel;
      this.releasedAt = undefined;
      break;
    default:
      throw new Error(`Unknown state: ${stage}`);
    }
    return [stage, v, amt];
  }
}

/**
 * Creates an {@link Adsr} envelope.
 * @param opts 
 * @returns New {@link Adsr} Envelope
 */
export const adsr = (opts:EnvelopeOpts):Adsr => new AdsrImpl(opts);

/**
 * Creates and runs an envelope, sampling its values at `sampleRateMs`.
 * 
 * ```
 * import {adsrSample, defaultAdsrOpts} from 'https://unpkg.com/ixfx/dist/modulation.js';
 * import {IterableAsync} from  'https://unpkg.com/ixfx/dist/util.js';
 * 
 * const opts = {
 *  ...defaultAdsrOpts(),
 *  attackDuration: 1000,
 *  releaseDuration: 1000,
 *  sustainLevel: 1,
 *  attackBend: 1,
 *  decayBend: -1
 * };
 * 
 * // Sample an envelope every 5ms into an array
 * const data = await IterableAsync.toArray(adsrSample(opts, 20));
 * 
 * // Work with values as sampled
 * for await (const v of adsrSample(opts, 5)) {
 *  // Work with envelope value `v`...
 * }
 * ```
 * @param opts Envelope options
 * @param sampleRateMs Sample rate
 * @returns 
 */
//eslint-disable-next-line func-style
export async function* adsrSample(opts:EnvelopeOpts, sampleRateMs:number) {
  if (opts.shouldLoop) throw new Error(`Cannot sample a looping envelope`);
  
  const env = adsr(opts);

  env.trigger();

  //eslint-disable-next-line functional/no-loop-statement
  while (true) {
    await sleep(sampleRateMs);
    const v = env.value;
    if (env.isDone) return;
    yield v;
  }
}
// export function* adsrSample (opts:EnvelopeOpts, sampleRateMs:number) {
//   if (opts.shouldLoop) throw new Error(`Cannot sample a looping envelope`);
  
//   const env = adsr(opts);
//   //const data:number[] = [];

//   //eslint-disable-next-line functional/no-let
//   let started = false;

//   return new Promise<number[]>((resolve, _reject) => {
//     continuously(() => {
//       if (!started) {
//         started = true;
//         env.trigger();
//       }

//       const v = env.value;
//       //eslint-disable-next-line functional/immutable-data
//       if (!Number.isNaN(v)) yield env.value;// data.push(env.value);
//       if (env.isDone) {
//         resolve(data);
//         return false;
//       }
//     }, sampleRateMs).start();
//   });
// };