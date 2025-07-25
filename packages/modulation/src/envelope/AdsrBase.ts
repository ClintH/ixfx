import { SimpleEventEmitter } from '@ixfx/events';
import { elapsedMillisecondsAbsolute, type Timer, type TimerSource } from '@ixfx/flow';
import { adsrStateTransitions, type AdsrEvents, type AdsrStateTransitions, type AdsrTimingOpts } from './Types.js';
import { StateMachineWithEvents } from '@ixfx/flow/state-machine';

export const defaultAdsrTimingOpts = Object.freeze({
  attackDuration: 600,
  decayDuration: 200,
  releaseDuration: 800,
  shouldLoop: false
})
/**
 * Base class for an ADSR envelope.
 * 
 * It outputs values on a scale of 0..1 corresponding to each phase.
 */
export class AdsrBase extends SimpleEventEmitter<AdsrEvents> {
  readonly #sm: StateMachineWithEvents<AdsrStateTransitions>;
  readonly #timeSource: TimerSource;

  #timer: Timer | undefined;
  #holding: boolean;
  #holdingInitial: boolean;
  #disposed = false;
  #triggered = false;
  protected attackDuration: number;
  protected decayDuration: number;
  protected releaseDuration: number;
  protected decayDurationTotal: number;

  /**
   * If _true_ envelope will loop
   */
  shouldLoop: boolean;

  constructor(opts: AdsrTimingOpts = {}) {
    super();

    this.attackDuration = opts.attackDuration ?? defaultAdsrTimingOpts.attackDuration;
    this.decayDuration = opts.decayDuration ?? defaultAdsrTimingOpts.decayDuration;
    this.releaseDuration = opts.releaseDuration ?? defaultAdsrTimingOpts.releaseDuration;
    this.shouldLoop = opts.shouldLoop ?? defaultAdsrTimingOpts.shouldLoop;

    this.#sm = new StateMachineWithEvents<AdsrStateTransitions>(
      adsrStateTransitions,
      { initial: `attack` }
    );

    this.#sm.addEventListener(`change`, (event) => {
      // Reset timer on release
      if (event.newState === `release` && this.#holdingInitial) {
        this.#timer?.reset();
      }
      super.fireEvent(`change`, event);
    });
    this.#sm.addEventListener(`stop`, (event) => {
      super.fireEvent(`complete`, event);
    });

    this.#timeSource = () => elapsedMillisecondsAbsolute();
    this.#holding = this.#holdingInitial = false;
    this.decayDurationTotal = this.attackDuration + this.decayDuration;
  }

  dispose() {
    if (this.#disposed) return;
    this.#sm.dispose();
  }

  get isDisposed() {
    return this.#disposed;
  }

  /**
   * Changes state based on timer status
   * @returns _True_ if state was changed
   */
  protected switchStateIfNeeded(allowLooping: boolean): boolean {
    if (this.#timer === undefined) return false;
    let elapsed = this.#timer.elapsed;
    const wasHeld = this.#holdingInitial && !this.#holding;

    // Change through states for as long as needed
    let hasChanged = false;
    //console.log(`AdsrBase.switchStateIfNeeded elapsed: ${ elapsed } wasHeld: ${ wasHeld }`);
    let state = this.#sm.state;
    do {
      hasChanged = false;
      state = this.#sm.state;
      //console.log(`  AdsrBase.switchStateIfNeeded: ${ state }`);
      switch (state) {
        case `attack`: {
          if (elapsed > this.attackDuration || wasHeld) {
            this.#sm.next();
            hasChanged = true;
          }
          break;
        }
        case `decay`: {
          if (elapsed > this.decayDurationTotal || wasHeld) {
            this.#sm.next();
            hasChanged = true;
          }
          break;
        }
        case `sustain`: {
          if (!this.#holding || wasHeld) {
            elapsed = 0;
            this.#sm.next();
            this.#timer.reset();
            hasChanged = true;
          }
          break;
        }
        case `release`: {
          if (elapsed > this.releaseDuration) {
            this.#sm.next();
            hasChanged = true;
          }
          break;
        }
        case `complete`: {
          if (this.shouldLoop && allowLooping) {
            this.trigger(this.#holdingInitial);
          }
        }
      }
    } while (hasChanged && state !== `complete`);
    return hasChanged;
  }

  /**
   * Computes a stage's progress from 0-1
   * @param allowStateChange
   * @returns
   */
  protected computeRaw(
    allowStateChange = true,
    allowLooping = true
  ): [ stage: string | undefined, amount: number, prevStage: string ] {
    if (this.#timer === undefined) {
      return [ undefined, 0, this.#sm.state ];
    }
    // Change state if necessary based on elapsed time
    if (allowStateChange) this.switchStateIfNeeded(allowLooping);

    const previousStage = this.#sm.state;
    const elapsed = this.#timer.elapsed;

    let relative = 0;
    const state = this.#sm.state;
    switch (state) {
      case `attack`: {
        relative = elapsed / this.attackDuration;
        break;
      }
      case `decay`: {
        relative = (elapsed - this.attackDuration) / this.decayDuration;
        break;
      }
      case `sustain`: {
        relative = 1;
        break;
      }
      case `release`: {
        relative = Math.min(elapsed / this.releaseDuration, 1);
        break;
      }
      case `complete`: {
        return [ `complete`, 1, previousStage ];
      }
      default: {
        throw new Error(`State machine in unknown state: ${ state }`);
      }
    }
    return [ state, relative, previousStage ];
  }

  /**
   * Returns _true_ if envelope has finished
   */
  get isDone(): boolean {
    return this.#sm.isDone;
  }

  protected onTrigger(): void {
    /* no op */
  }

  /**
   * Triggers envelope, optionally _holding_ it.
   * 
   * If `hold` is _false_ (default), envelope will run through all stages,
   * but sustain stage won't have an affect.
   * 
   * If `hold` is _true_, it will run to, and stay at the sustain stage. 
   * Use {@link release} to later release the envelope.
   *
   * If event is already trigged it will be _retriggered_. 
   * Initial value depends on `opts.retrigger`
   * * _false_ (default): envelope continues at current value.
   * * _true_: envelope value resets to `opts.initialValue`.
   *
   * @param hold If _true_ envelope will hold at sustain stage
   */
  trigger(hold = false) {
    this.onTrigger();
    this.#triggered = true;
    this.#sm.reset();
    this.#timer = this.#timeSource();
    this.#holding = hold;
    this.#holdingInitial = hold;
  }

  get hasTriggered() {
    return this.#triggered;
  }

  compute(): void {
    /* no-op */
  }

  /**
   * Release if 'trigger(true)' was previouslly called.
   * Has no effect if not triggered or held.
   * @returns 
   */
  release() {
    if (this.isDone || !this.#holdingInitial) return; // Was never holding or done

    // Setting holding flag to false, computeRaw will change state
    this.#holding = false;
    this.compute();
  }
}