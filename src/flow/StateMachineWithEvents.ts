import { SimpleEventEmitter } from '../Events.js';
import * as StateMachine from './StateMachine.js';
import * as Elapsed from './Elapsed.js';
import type { StateNames, Transitions, MachineState } from './StateMachine.js';

export type StateChangeEvent<V extends Transitions> = {
  readonly newState: StateNames<V>;
  readonly priorState: StateNames<V>;
};

export type StopEvent<V extends Transitions> = {
  readonly state: StateNames<V>;
};

export type StateMachineEventMap<V extends Transitions> = {
  readonly change: StateChangeEvent<V>;
  readonly stop: StopEvent<V>;
};

export type Opts<V extends Transitions> = {
  readonly debug?: boolean;
  readonly initial?: StateNames<V>;
};

/**
 * A state machine that fires events when state changes.
 * 
 * ```js
 * const transitions = StateMachine.fromList(`a`, `b`, `c`);
 * const m = new StateMachineWithEvents(transitions);
 * m.addEventListener(`change`, event => {
 *  console.log(`${event.priorState} -> ${event.newState}`);
 * });
 * m.addEventListener(`stop`, event => {
 *  console.log(`State machine has reached final state`);
 * });
 * ```
 */
export class StateMachineWithEvents<
  V extends Transitions,
> extends SimpleEventEmitter<StateMachineEventMap<V>> {
  #sm: MachineState<V>;
  #smInitial: MachineState<V>;

  #debug: boolean;
  #isDoneNeedsFiring = false;
  #isDone = false;
  #changedAt = Elapsed.infinity();

  /**
   * Create a state machine with initial state, description and options
   * @param m Machine description
   * @param opts Options for machine (defaults to `{debug:false}`)
   */
  constructor(m: V, opts: Opts<V> = {}) {
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
        this.fireEvent(`stop`, { state: this.#sm.value });
      }, 2);
    } else {
      this.#isDoneNeedsFiring = false;
    }
  }

  /**
   * Return a list of possible states from current state.
   *
   * If list is empty, no states are possible. Otherwise lists
   * possible states, including 'null' for terminal
   */
  get statesPossible(): ReadonlyArray<StateNames<V> | null> {
    return StateMachine.possible(this.#sm);
  }

  /**
   * Return a list of all defined states
   */
  get statesDefined(): ReadonlyArray<StateNames<V>> {
    return Object.keys(this.#sm.machine);
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
    this.state = p[ 0 ]!;
    return p[ 0 ]!;
  }

  /**
   * Returns _true_ if state machine is in its final state
   *
   * @returns
   */
  get isDone(): boolean {
    return StateMachine.done(this.#sm);
  }

  /**
   * Resets machine to initial state
   */
  reset() {
    this.#setIsDone(false);
    this.#sm = StateMachine.cloneState(this.#smInitial);

    //eslint-disable-next-line functional/immutable-data
    this.#changedAt = Elapsed.since();
  }

  /**
   * Throws if it's not valid to transition to `newState`
   * @param newState
   * @returns
   */
  validateTransition(newState: StateNames<V>): void {
    StateMachine.validateTransition(this.#sm, newState);
  }

  /**
   * Returns _true_ if `newState` is valid transition from current state.
   * Use {@link validateTransition} if you want an explanation for the _false_ results.
   * @param newState
   * @returns
   */
  isValid(newState: StateNames<V>): boolean {
    return StateMachine.isValidTransition(this.#sm, newState);
  }

  /**
   * Gets or sets state. Throws an error if an invalid transition is attempted.
   * Use `isValid()` to check validity without changing.
   *
   * If `newState` is the same as current state, the request is ignored silently.
   *
   * @memberof StateMachine
   */
  set state(newState: StateNames<V>) {
    const priorState = this.#sm.value;
    if (newState === this.#sm.value) return;

    // Try to change state
    this.#sm = StateMachine.to(this.#sm, newState);
    if (this.#debug) {
      console.log(`StateMachine: ${ priorState } -> ${ newState }`);
    }
    this.#changedAt = Elapsed.since();
    setTimeout(() => {
      this.fireEvent(`change`, { newState: newState, priorState: priorState });
    }, 1);

    if (StateMachine.done(this.#sm)) this.#setIsDone(true);
  }

  get state(): string {
    return this.#sm.value;
  }

  /**
   * Returns timestamp when state was last changed.
   * See also `elapsed`
   */
  get changedAt(): number {
    return this.#changedAt();
  }

  /**
   * Returns milliseconds elapsed since last state change.
   * See also `changedAt`
   */
  get elapsed(): number {
    return this.#changedAt();
  }
}
