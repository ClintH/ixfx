/* eslint-disable */
import {SimpleEventEmitter} from "../Events.js";
import {msRelativeTimer, Timer, TimerSource} from "../Timer.js";
import { StateMachine, fromList as descriptionFromList } from "../StateMachine.js";
import {Path} from "~/geometry/Path.js";
import * as Bezier from '../geometry/Bezier.js';

export const defaultAdsrOpts = ():AdsrOpts => ({
  attackBend: 0,
  decayBend: 0,
  releaseBend: 0,
  peakLevel: 1,
  initialLevel: 0,
  sustainLevel: 0.75,
  releaseLevel: 0,
  attackDuration: 100,
  decayDuration: 200,
  releaseDuration: 500
});

export type AdsrOpts = AdsrBaseOpts & {
  /**
   * Attack bezier 'bend'
   *
   * @type {number} Bend from -1 to 1. 0 for a straight line
   */
   readonly attackBend?: number
  /**
   * Decay bezier 'bend'
   *
   * @type {number} Bend from -1 to 1. 0 for a straight line
   */
   readonly decayBend?: number
  /**
   * Release bezier 'bend'
   *
   * @type {number} Bend from -1 to 1. 0 for a straight line
   */
   readonly releaseBend?: number

   readonly peakLevel?:number

   readonly initialLevel?:number
 
   readonly sustainLevel?:number

   readonly releaseLevel?:number
}

export type AdsrBaseOpts = {
  /**
   * If true, envelope indefinately returns to attack stage after release
   *
   * @type {boolean}
   */
  readonly shouldLoop?: boolean

  /**
    * Duration for delay stage
    * Unit depends on timer source
    * @type {number}
    */
  readonly delayDuration?: number,
  /**
   * Duration for attack stage
   * Unit depends on timer source
   * @type {number}
   */
  readonly attackDuration?: number,
  /**
   * Duration for decay stage
   * Unit depends on timer source
   * @type {number}
   */
  readonly decayDuration?: number,
  /**
   * Duration for release stage
   * Unit depends on timer source
   * @type {number}
   */
  readonly releaseDuration?: number
}

export interface StateChangeEvent {
  readonly newState: string,
  readonly priorState: string
}

export interface CompleteEvent {

}

type Events = {
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

  constructor(opts:AdsrBaseOpts) {
    super();
    
    this.attackDuration = opts.attackDuration ?? 300;
    this.decayDuration = opts.decayDuration ?? 500;
    this.releaseDuration = opts.releaseDuration ?? 1000;
    this.shouldLoop = opts.shouldLoop ?? false;

    const descr = descriptionFromList(`attack`, `decay`, `sustain`, `release`, `complete`);
    this.#sm = new StateMachine(`attack`, descr);
    this.#sm.addEventListener(`change`, (ev => {
      super.fireEvent(`change`, ev);
    }));
    this.#sm.addEventListener(`stop`, (ev => {
      super.fireEvent(`complete`, ev);
    }));
    
    this.#timeSource = msRelativeTimer;
    this.#holding = this.#holdingInitial = false;

    this.decayDurationTotal = this.attackDuration + this.decayDuration;
  }

  switchState() {
    if (this.#timer === undefined) return;
    let elapsed = this.#timer.elapsed();

    // Change through states for as long as needed
    let changed = false;
    do {
      changed = false;
      switch (this.#sm.state) {
      case `attack`:
        if (elapsed > this.attackDuration) {
          this.#sm.next();
          changed = true;
        }
        break;
      case `decay`:
        if (elapsed > this.decayDurationTotal) {
          this.#sm.next();
          changed = true;
        }
        break;
      case `sustain`:
        if (!this.#holding) {
          elapsed = 0;
          this.#timer?.reset();
          this.#sm.next();
          changed = true;
        }
        break;
      case `release`:
        if (elapsed > this.releaseDuration) {
          this.#sm.next();
          changed = true;
        }      
      case `complete`:
        if (this.shouldLoop) {
          this.trigger(this.#holdingInitial);
        }
      }
    } while (changed); 
  }

  computeRaw():[stage:string|undefined,amount:number] {
    if (this.#timer === undefined) return [undefined, 0];
  
    
    // Change state if necessary based on elapsed time
    this.switchState();
    let elapsed = this.#timer.elapsed();
    
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
      relative = elapsed / this.releaseDuration;
      break;
    case `complete`:
      return [undefined, 0];
    default:
      throw new Error(`State machine in unknown state: ${state}`);
    }
    return [state, relative];
  }

  get isDone():boolean {
    return this.#sm.isDone;
  }

  trigger(hold:boolean = false) {
    this.#sm.reset();
    this.#timer = this.#timeSource();
    this.#holding = hold;
    this.#holdingInitial = hold;
  }

  release() {
    this.#holding = false;
  }
}

class Adsr extends AdsrBase {
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

  constructor(opts:AdsrOpts) {
    super(opts);

    this.initialLevel = opts.initialLevel ?? 0;
    this.peakLevel = opts.peakLevel ?? 1;
    this.releaseLevel = opts.releaseLevel ?? 0;
    this.sustainLevel = opts.sustainLevel ?? 0.75;

    this.attackBend = opts.attackBend ?? 0;
    this.releaseBend = opts.releaseBend ?? 0;
    this.decayBend = opts.decayBend ?? 0;

    const max = 1;
    this.attackPath = Bezier.toPath(Bezier.quadraticSimple({x: 0, y: this.initialLevel}, {x: max, y: this.peakLevel}, this.attackBend));
    this.decayPath = Bezier.toPath(Bezier.quadraticSimple({x: 0, y: this.peakLevel}, {x: max, y: this.sustainLevel}, this.decayBend));
    this.releasePath = Bezier.toPath(Bezier.quadraticSimple({x: 0, y: this.sustainLevel}, {x: max, y: 0}, this.releaseBend));
  }

  compute():[stage:string|undefined, scaled:number, raw:number] {
    const [stage, amt] = super.computeRaw();
    if (stage === undefined) return [undefined, NaN, NaN];
    let v;
    switch (stage) {
      case `attack`:
        v = this.attackPath.compute(amt);
        break;
      case `decay`:
        v = this.decayPath.compute(amt);
        break;
      case `sustain`:
        v = {x:1, y:this.sustainLevel};
        break;
      case `release`:
        v = this.releasePath.compute(amt);
        break;
      case `complete`:
        v = {x:1, y: this.releaseLevel};
        break;
      default:
        throw new Error(`Unknown state: ${stage}`);
    }

    return [stage, v.y, amt];
  }
}

export const adsr = (opts:AdsrOpts):Adsr => new Adsr(opts);