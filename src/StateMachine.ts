//export type StateChangeCallback = (newState: string, priorState: string) => void;
import {SimpleEventEmitter} from "./Events.js";
import { isStringArray } from "./Guards.js";
/*
type MappedTypeWithNewProperties<Type> = {
  [Properties in keyof Type as NewKeyType]: Type[Properties]
}
*/
// type MachineEventMap<M extends MachineDescription> = {
//   [Properties in keyof M as ]
// }

export interface Options {
  debug?: boolean
}

//type StateName = string | number | Symbol;

export interface StateChangeEvent {
  newState: string,
  priorState: string
}

export interface StopEvent {
  state: string;
}

// type Paths<T> = T extends MachineDescription
//   ? keyof T | {[K in keyof T]: Paths<T[K]['events']>}[keyof T]
//   : never

type StateMachineEventMap = {
  change: StateChangeEvent
  stop: StopEvent
};

//type ValidStates<M extends MachineDescription> = keyof M & string;


type StateEvent = (args: any, sender: StateMachine) => string | any;
type StateHandler = string | StateEvent | null;

export interface State {
  [event: string]: StateHandler;
}

export interface MachineDescription {
  [key: string]: string | string[] | null;
}

// export type StateEventCallback<M extends MachineDescription> = (event: string, state: ValidStates<M>, params: any, machine: StateMachine<M>) => boolean;

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
 * const machine = new StateMachine(`sleep`, description);
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
  #state: string;
  #debug: boolean;
  #m: MachineDescription;
  #isDone: boolean;
  #initial: string;

  /**
   * Create a state machine with initial state, description and options
   * @param {string} initial Initial state
   * @param {MachineDescription} m Machine description
   * @param {Options} [opts={debug: false}] Options for machine
   * @memberof StateMachine
   */
  constructor(initial: string, m: MachineDescription, opts: Options = {debug: false}) {
    super();
    const [valid, errorMsg] = StateMachine.validate(initial, m);
    if (!valid) throw new Error(errorMsg);

    this.#initial = initial;
    this.#m = m;
    this.#debug = opts.debug ?? false;
    this.#state = initial;
    this.#isDone = false;
  }

  get states():string[] {
    return Object.keys(this.#m);
  }

  static validate(initial:string, m:MachineDescription):[boolean, string]  {
    // Check that object is structured properly
    const keys = Object.keys(m);
    const finalStates:string[] = [];
    const seenKeys = new Set();
    const seenVals = new Set();

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
        finalStates.push(key);
      } else {
        return [false, `Key ${key} has a value that is neither null, string or array`];
      }
    }

    // Check that all values have a top-level state
    const seenValsArray = Array.from(seenVals);
    const missing = seenValsArray.find(v => !seenKeys.has(v));
    if (missing) return [false, `Potential state ${missing} does not exist as a top-level state`];

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
    const r = this.#m[this.#state];
    if (r === null) return null;

    if (Array.isArray(r)) this.state = r[0];
    else this.state = r;
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
    this.#isDone = false;
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
  static isValid(priorState:string, newState:string, description:MachineDescription):[boolean, string] {
    // Does state exist?
    if (description[newState] === undefined) return [false, `Machine cannot change to non-existent state ${newState}`];

    // Is transition allowed?
    const rules = description[priorState];
    if (Array.isArray(rules)) {
      if (!rules.includes(newState)) return [false, `Machine cannot ${priorState} -> ${newState}. Allowed transitions: ${rules.join(`, `)}`];
    } else {
      if (newState !== rules && rules !== `*`) return [false, `Machine cannot ${priorState} -> ${newState}. Allowed transition: ${rules}`];
    }
    return [true, `ok`];
  }

  isValid(newState:string):[boolean, string] {
    return StateMachine.isValid(this.state, newState, this.#m);
  }

  /**
   * Sets state. Throws an error if an invalid transition is attempted.
   * Use `StateMachine.isValid` to check validity without changing.
   *
   * @memberof StateMachine
   */
  set state(newState: string) {
    const priorState = this.#state;

    const [allowed, errorMsg] = StateMachine.isValid(priorState, newState, this.#m);

    if (!allowed) throw new Error(errorMsg);

    if (this.#debug) console.log(`StateMachine: ${priorState} -> ${newState}`);
    this.#state = newState;

    let rules = this.#m[priorState];
    rules = this.#m[newState];
    if (rules === null) this.#isDone = true;

    setTimeout(() => {
      this.fireEvent(`change`, {newState: newState, priorState: priorState});
      if (this.isDone) this.fireEvent(`stop`, {state: newState });
    }, 1);
  }

  /**
 * Return current state
 *
 * @type {string}
 * @memberof StateMachine
 */
  get state(): string {
    return this.#state;
  }
  /*
  fire(eventName: string, params?: any): boolean {
    let handler = this.#state[eventName];
    if (handler === undefined) {
      if (this.#debug) console.log(`StateMachine: state '${this.#stateName}' has no handler for event '${eventName}'.`);
      return false; // Event is not handled in this state
    }
    if (typeof (handler) === 'string') {
      // Strings are assumed to be the next state
      return this.#setState(handler)
    } else if (handler == null) {
      this.#isDone = true;
      this.fireEvent('stop', {state: this.#stateName});
      return false;
    } else {
      // Call function
      let state = handler(params, this);
      if (state !== undefined && typeof state === 'string') {
        // If handler returns string, assume it's a new state
        this.#setState(state);
      }
      return true;
    }
  }*/

}


/*
interface ListMachineDefinition {
  [key: string]: State;
}

class ListStateMachine extends StateMachine {
  constructor(initial: string, listMachineDef: ListMachineDefinition, opts?: Options) {
    super(initial, listMachineDef, opts)
  }

  next(params?: any): boolean {
    return this.fire('next', params);
  }
}

const createListMachine = (list: string[], opts?: Options): ListStateMachine => {
  let map = {};
  for (let i = 0; i < list.length; i++) {
    let next = i < list.length - 1 ? list[i + 1] : null;
    let state = {next}
    // @ts-ignore
    map[list[i]] = state;
  }

  return new ListStateMachine(list[0], map, opts);
}*/
