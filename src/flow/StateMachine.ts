// ✔ UNIT TESTED

import {SimpleEventEmitter} from "../Events.js";
import { isStringArray } from "../Guards.js";

export interface Options {
  readonly debug?: boolean
}

export interface StateChangeEvent {
  readonly newState: string,
  readonly priorState: string
}

export interface StopEvent {
  readonly state: string;
}

export type StateMachineEventMap = {
  readonly change: StateChangeEvent
  readonly stop: StopEvent
};

export type StateEvent = (args: unknown, sender: StateMachine) => void;
export type StateHandler = string | StateEvent | null;

export interface State {
  readonly [event: string]: StateHandler;
}

export interface MachineDescription {
  readonly [key: string]: string | readonly string[] | null;
}

/**
 * Returns a machine description based on a list of strings. The final string is the final
 * state.
 * 
 * ```js
 * const states = [`one`, `two`, `three`];
 * const sm = StateMachine.create(states[0], descriptionFromList(states));
 * ```
 * @param {...readonly} states
 * @param {*} string
 * @param {*} []
 * @return {*}  {MachineDescription}
 */
export const descriptionFromList = (...states:readonly string[]):MachineDescription => {
  const t = {};
  // eslint-disable-next-line functional/no-loop-statement, functional/no-let
  for (let i=0;i<states.length; i++) {
    if (i === states.length - 1) {
      /** @ts-ignore */
      // eslint-disable-next-line functional/immutable-data 
      t[states[i]] = null;
    } else {
      /** @ts-ignore */
      // eslint-disable-next-line functional/immutable-data
      t[states[i]] = states[i+1];
    }
  }
  return t;
};

/**
 * Returns a state machine based on a list of strings. The first string is used as the initial state,
 * the last string is considered the final. To just generate a description, use {@link descriptionFromList}.
 * 
 * ```js
 * const states = [`one`, `two`, `three`];
 * const sm = StateMachine.fromList(states);
 * ```
 */
export const fromList = (...states:readonly string[]):StateMachine => new StateMachine(states[0], descriptionFromList(...states));

/**
 * Creates a new state machine
 * @param initial Initial state
 * @param m Machine description
 * @param opts Options
 * @returns State machine instance
 */
export const create = (initial: string, m: MachineDescription, opts: Options = {debug: false}):StateMachine =>  new StateMachine(initial, m, opts);

/**
 * State machine
 *
 * Machine description is a simple object of possible state names to allowed state(s). Eg. the following
 * has four possible states (`wakeup, sleep, coffee, breakfast, bike`). `Sleep` can only transition to the `wakeup`
 * state, while `wakeup` can transition to either `coffee` or `breakfast`. 
 * 
 * Use `null` to signify the final state. Multiple states can terminate the machine if desired.
 * ```
 * const description = { 
 *  sleep: 'wakeup',
 *  wakeup: ['coffee', 'breakfast'],
 *  coffee: `bike`,
 *  breakfast: `bike`,
 *  bike: null
 * }
 * ```
 * Create the machine with the starting state (`sleep`)
 * ```
 * const machine = StateMachine.create(`sleep`, description);
 * ```
 * 
 * Change the state by name:
 * ```
 * machine.state = `wakeup`
 * ```
 * 
 * Or request an automatic transition (will use first state if there are several options)
 * ```
 * machine.next();
 * ```
 * 
 * Check status
 * ```
 * if (machine.state === `coffee`) ...;
 * if (machine.isDone()) ...
 * ```
 * 
 * Listen for state changes
 * ```
 * machine.addEventListener(`change`, (evt) => {
 *  const {priorState, newState} = evt;
 *  console.log(`State change from ${priorState} -> ${newState}`);
 * });
 * ```
 * @export
 * @class StateMachine
 * @extends {SimpleEventEmitter<StateMachineEventMap>}
 */
export class StateMachine extends SimpleEventEmitter<StateMachineEventMap> {
  // eslint-disable-next-line functional/prefer-readonly-type
  #state: string;
  // eslint-disable-next-line functional/prefer-readonly-type
  #debug: boolean;
  // eslint-disable-next-line functional/prefer-readonly-type
  #m: MachineDescription;
  // eslint-disable-next-line functional/prefer-readonly-type
  #isDone: boolean;
  // eslint-disable-next-line functional/prefer-readonly-type
  #initial: string;

  /**
   * Create a state machine with initial state, description and options
   * @param string initial Initial state
   * @param MachineDescription m Machine description
   * @param Options Options for machine (defaults to `{debug:false}`)
   * @memberof StateMachine
   */
  constructor(initial: string, m: MachineDescription, opts: Options = {debug: false}) {
    super();
    const [isValid, errorMsg] = StateMachine.validate(initial, m);
    if (!isValid) throw new Error(errorMsg);

    this.#initial = initial;
    this.#m = m;
    this.#debug = opts.debug ?? false;
    this.#state = initial;
    this.#isDone = false;
  }

  get states():readonly string[] {
    return Object.keys(this.#m);
  }

  static validate(initial:string, m:MachineDescription):readonly [boolean, string]  {
    // Check that object is structured properly
    const keys = Object.keys(m);
    // eslint-disable-next-line functional/prefer-readonly-type
    const finalStates:string[] = [];
    const seenKeys = new Set();
    const seenVals = new Set();

    // eslint-disable-next-line functional/no-loop-statement, functional/no-let
    for (let i=0;i<keys.length;i++) {
      const key = keys[i];
      if (seenKeys.has(key)) return [false, `Key ${key} is already used`];
      seenKeys.add(key);

      if (typeof keys[i] !== `string`) return [false, `Key[${i}] is not a string`];
      const val = m[key];
      if (val === undefined) return [false, `Key ${key} value is undefined`];
      if (typeof val === `string`) {
        seenVals.add(val);
        if (val === key) return [false, `Loop present for ${key}`];
      } else if (Array.isArray(val)) {
        if (!isStringArray(val)) return [false, `Key ${key} value is not an array of strings`];
        val.forEach(v => seenVals.add(v));
        if (val.find(v => v === key)) return [false, `Loop present for ${key}`];
      } else if (val === null) {
        // eslint-disable-next-line functional/immutable-data
        finalStates.push(key);
      } else {
        return [false, `Key ${key} has a value that is neither null, string or array`];
      }
    }

    // Check that all values have a top-level state
    const seenValsArray = Array.from(seenVals);
    const missing = seenValsArray.find(v => !seenKeys.has(v));
    if (missing) return [false, `Potential state '${missing}' does not exist as a top-level state`];

    // Check machine contains intial state
    if (m[initial] === undefined) return [false, `Initial state ${initial} not present`];
    return [true, ``];
  }

  /**
   * Moves to the next state if possible. If multiple states are possible, it will use the first.
   * If machine is finalised, no error is thrown and null is returned.
   * 
   * @returns {(string|null)} Returns new state, or null if machine is finalised
   * @memberof StateMachine
   */
  next(): string | null {
    // Get possible transitions for current state
    const r = this.#m[this.#state];
    if (r === null) return null; // At the end

    // If there are multiple options, use the first
    if (Array.isArray(r)) {
      // eslint-disable-next-line functional/immutable-data
      if (typeof r[0] === `string`) this.state = r[0];
      else throw new Error(`Error in machine description. Potential state array does not contain strings`);
    } else if (typeof r === `string`) {
      // eslint-disable-next-line functional/immutable-data
      this.state = r; // Just one option
    } else throw new Error(`Error in machine description. Potential state is neither array nor string`);
    return this.state;
  }

  /**
   * Returns true if state machine is in its final state
   *
   * @returns
   * @memberof StateMachine
   */
  get isDone():boolean {
    return this.#isDone;
  }

  /**
   * Resets machine to initial state
   *
   * @memberof StateMachine
   */
  reset() {
    // eslint-disable-next-line functional/immutable-data
    this.#isDone = false;
    // eslint-disable-next-line functional/immutable-data
    this.#state = this.#initial;
  }

  /**
   * Checks whether a state change is valid.
   *
   * @static
   * @param {string} priorState From state
   * @param {string} newState To state
   * @param {MachineDescription} description Machine description
   * @returns {[boolean, string]} If valid: [true,''], if invalid: [false, 'Error msg here']
   * @memberof StateMachine
   */
  static isValid(priorState:string, newState:string, description:MachineDescription):readonly [boolean, string] {
    // Does state exist?
    if (description[newState] === undefined) return [false, `Machine cannot change to non-existent state ${newState}`];

    // Is transition allowed?
    const rules = description[priorState];
    if (Array.isArray(rules)) {
      if (!rules.includes(newState)) return [false, `Machine cannot change '${priorState} -> ${newState}'. Allowed transitions: ${rules.join(`, `)}`];
    } else {
      if (newState !== rules && rules !== `*`) return [false, `Machine cannot '${priorState} -> ${newState}'. Allowed transition: ${rules}`];
    }
    return [true, `ok`];
  }

  isValid(newState:string):readonly [boolean, string] {
    return StateMachine.isValid(this.state, newState, this.#m);
  }

  /**
   * Gets or sets state. Throws an error if an invalid transition is attempted.
   * Use `StateMachine.isValid` to check validity without changing.
   *
   * @memberof StateMachine
   */
  set state(newState: string) {
    const priorState = this.#state;

    const [isValid, errorMsg] = StateMachine.isValid(priorState, newState, this.#m);

    if (!isValid) throw new Error(errorMsg);

    if (this.#debug) console.log(`StateMachine: ${priorState} -> ${newState}`);

    // eslint-disable-next-line functional/immutable-data
    this.#state = newState;

    const rules = this.#m[newState];
    if (rules === null) {
      // eslint-disable-next-line functional/immutable-data
      this.#isDone = true;
    }
    setTimeout(() => {
      this.fireEvent(`change`, {newState: newState, priorState: priorState});
      if (this.isDone) this.fireEvent(`stop`, {state: newState });
    }, 1);
  }

  get state(): string {
    return this.#state;
  }
}