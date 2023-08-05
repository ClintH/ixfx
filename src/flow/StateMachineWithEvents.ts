import { SimpleEventEmitter } from '../Events.js';
import * as StateMachine from './StateMachine.js';

import type { StateNames, Transitions, MachineState } from './StateMachine.js';
import { Elapsed } from './index.js';

export interface StateChangeEvent {
  readonly newState: string;
  readonly priorState: string;
}

export interface StopEvent {
  readonly state: string;
}

export type StateMachineEventMap = {
  readonly change: StateChangeEvent;
  readonly stop: StopEvent;
};

export type StateMachineOpts = {
  readonly debug?: boolean;
  readonly initial?: string;
};

export class StateMachineWithEvents<
  V extends Transitions,
> extends SimpleEventEmitter<StateMachineEventMap> {
  #sm: MachineState<V>;
  #smInitial: MachineState<V>;

  #debug: boolean;
  #isDoneNeedsFiring = false;
  #isDone = false;
  #changedAt = Elapsed.infinity();

  /**
   * Create a state machine with initial state, description and options
   * @param string initial Initial state
   * @param MachineDescription m Machine description
   * @param Options Options for machine (defaults to `{debug:false}`)
   * @memberof StateMachine
   */
  constructor(m: V, opts: StateMachineOpts = {}) {
    super();

    this.#debug = opts.debug ?? false;
    this.#sm = StateMachine.init(m, opts.initial);
    this.#smInitial = StateMachine.cloneState(this.#sm);
  }

  #setIsDone(v: boolean) {
    if (this.#isDone === v) return;
    this.#isDone = v;
    if (v) {
      this.#isDoneNeedsFiring = true;
      setTimeout(() => {
        if (!this.#isDoneNeedsFiring) return;
        this.#isDoneNeedsFiring = false;
        //console.log(`StateMachine isDone (${this.#state}), firing stop.`);
        this.fireEvent(`stop`, { state: this.#sm.value as string });
      }, 2);
    } else {
      this.#isDoneNeedsFiring = false;
    }
  }

  /**
   * Return a list of possible states from current state
   */
  get statesPossible(): readonly StateNames<V>[] {
    return StateMachine.possible(this.#sm);
  }

  /**
   * Return a list of all defined states
   */
  get statesDefined(): readonly StateNames<V>[] {
    return Object.keys(this.#sm.states);
  }

  /**
   * Moves to the next state if possible. If multiple states are possible, it will use the first.
   * If machine is finalised, no error is thrown and null is returned.
   *
   * @returns {(string|null)} Returns new state, or null if machine is finalised
   * @memberof StateMachine
   */
  next(): string | null {
    const p = StateMachine.possible(this.#sm);
    if (p.length === 0) return null;
    this.state = p[0] as string;
    return p[0] as string;
  }

  /**
   * Returns true if state machine is in its final state
   *
   * @returns
   * @memberof StateMachine
   */
  get isDone(): boolean {
    return StateMachine.done(this.#sm);
  }

  /**
   * Resets machine to initial state
   *
   * @memberof StateMachine
   */
  reset() {
    this.#setIsDone(false);
    this.#sm = StateMachine.cloneState(this.#smInitial);

    //eslint-disable-next-line functional/immutable-data
    this.#changedAt = Elapsed.since();
  }

  /**
   * Returns whether `newState` is a valid transition from current state,
   * along with a message explanation. Use {@link isValid} if you just want a simple boolean
   * @param newState
   * @returns
   */
  validateTransition(
    newState: StateNames<V>
  ): readonly [valid: boolean, msg: string, posisble: StateNames<V>[]] {
    return StateMachine.validate(this.#sm, newState);
  }

  /**
   * Returns _true_ if `newState` is valid transition from current state.
   * Use {@link validateTransition} if you want an explanation for the _false_ results.
   * @param newState
   * @returns
   */
  isValid(newState: StateNames<V>): boolean {
    return StateMachine.isValid(this.#sm, newState);
  }

  /**
   * Gets or sets state. Throws an error if an invalid transition is attempted.
   * Use `StateMachine.isValid` to check validity without changing.
   *
   * If `newState` is the same as current state, the request is ignored silently.
   *
   * @memberof StateMachine
   */
  set state(newState: string) {
    const priorState = this.#sm.value as string;
    if (newState === this.#sm.value) return;

    // Try to change state
    this.#sm = StateMachine.to(this.#sm, newState);
    if (this.#debug) console.log(`StateMachine: ${priorState} -> ${newState}`);
    this.#changedAt = Elapsed.since();
    setTimeout(() => {
      this.fireEvent(`change`, { newState: newState, priorState: priorState });
    }, 1);

    if (StateMachine.done(this.#sm)) this.#setIsDone(true);
  }

  get state(): string {
    return this.#sm.value as string;
  }

  /**
   * Returns timestamp when state was last changed.
   * See also `elapsed`
   */
  //eslint-disable-next-line functional/prefer-tacit
  get changedAt(): number {
    return this.#changedAt();
  }

  /**
   * Returns milliseconds elapsed since last state change.
   * See also `changedAt`
   */
  //eslint-disable-next-line functional/prefer-tacit
  get elapsed(): number {
    return this.#changedAt();
  }
}
