/**
 * Transition result
 * * 'Ok': transition valid
 * * 'FromNotFound': the from state is missing from machine definition
 * * 'ToNotFound': the 'to' state is missing from machine definition
 * * 'Invalid': not allowed to transition to target state from the current state
 * * 'Terminal':  not allowed to transition because from state is the final state
 */
export type TransitionResult =
  | 'Ok'
  | 'FromNotFound'
  | 'ToNotFound'
  | 'Invalid'
  | 'Terminal';

/**
 * Possible state transitions, or _null_ if final state.
 */
type StateTarget = string | readonly string[] | null;

/**
 * Maps state to allowable next states
 */
export type Transitions = {
  readonly [key: string]: StateTarget;
};

/**
 * List of possible states
 */
export type StateNames<V extends Transitions> = keyof V;

export type Machine<V extends Transitions> = {
  /**
   * Machine description, describing allowable
   * state transitions
   */
  readonly states: V;
};
/**
 * Encapsulation of machine description and state
 */
export type MachineState<V extends Transitions> = Machine<V> & {
  /**
   * Current state
   */
  readonly value: StateNames<V>;
  /**
   * List of unique states visited. Won't contain the current
   * state unless it has already been visited.
   */
  readonly visited: readonly StateNames<V>[];
};

export const cloneState = <V extends Transitions>(
  a: MachineState<V>
): MachineState<V> => {
  return Object.freeze({
    value: a.value,
    visited: a.visited,
    states: { ...a.states },
  });
};
/**
 * Initialises a state machine
 * ```js
 * const desc = {
 *  pants: ['shoes','socks'],
 *  socks: ['shoes', 'pants'],
 *  shoes: 'shirt',
 *  shirt: null
 * }
 * // Defaults to first key, 'pants'
 * let sm = StateMachineLight.init(descr);
 * // Move to 'shoes' state
 * sm = StateMachineLight.to(sm, 'shoes');
 * sm.state; // 'shoes'
 * sm.visited; // [ 'pants' ]
 * StateMachineLight.done(sm); // false
 * StateMachineLight.possible(sm); // [ 'shirt' ]
 * ```
 * @param sm
 * @param initialState
 * @returns
 */
export const init = <V extends Transitions>(
  sm: V,
  initialState?: StateNames<V>
): MachineState<V> => {
  const state: StateNames<V> =
    (initialState as StateNames<V>) ?? Object.keys(sm)[0];
  if (typeof sm[state] === 'undefined') {
    throw new Error(`Initial state not found`);
  }

  const [validationOk, validationMsg] = validateDescription(sm);
  if (!validationOk) {
    throw new Error(`Machine not valid: ${validationMsg}`);
  }

  return {
    value: state,
    states: { ...sm },
    visited: [],
  };
};

/**
 * Returns _true_ if `sm` is in its final state.
 * @param sm
 * @returns
 */
export const done = <V extends Transitions>(sm: MachineState<V>): boolean => {
  const p = possible(sm);
  if (p.length === 0) return true;
  return false;
};

/**
 * Returns a list of possible states for `sm`, or
 * an empty list if no transitions are possible.
 * @param sm
 * @returns
 */
export const possible = <V extends Transitions>(
  sm: MachineState<V>
): StateNames<V>[] => {
  const fromS = validateState(sm);
  if (fromS === null) return [];
  if (Array.isArray(fromS)) {
    if (fromS.length === 1 && fromS[0] === null) return [];
    return fromS;
  }
  return [fromS as StateNames<V>];
};

const validateDescription = (d: Transitions): [error: boolean, msg: string] => {
  const normaliseTargets = (s: StateTarget): StateNames<any>[] => {
    if (s === null) return [];
    if (typeof s === 'undefined') throw new Error(`Undefined target`);
    if (typeof s === 'string') return [s];
    if (Array.isArray(s)) {
      if (s.length === 1 && s[0] === null) return [];
      for (const ss of s) {
        if (typeof ss === `undefined`) {
          throw new Error(`Undefined target exists in array`);
        }
      }
      return s;
    }
    throw new Error('Invalid target');
  };

  // 0. Index top-level states, checking for dupes
  const definedStates = new Set();
  for (const e of Object.entries(d)) {
    if (typeof e[0] === `undefined`) {
      throw new Error(`Top-level undefined state`);
    }
    if (typeof e[1] === `undefined`) {
      throw new Error(`Undefined target state for ${e[0]}`);
    }
    if (definedStates.has(e[0])) {
      return [false, `State defined twice: ${e[0]}`];
    }
    definedStates.add(e[0]);
  }

  // 1. Index target states
  const targetStates = new Set();
  for (const e of Object.entries(d)) {
    const eS = normaliseTargets(e[1]);
    //eslint-disable-next-line functional/prefer-tacit
    eS.forEach((x) => targetStates.add(x));
  }

  // 2. Check each target state is also described at a top-level
  for (const s of targetStates) {
    if (!definedStates.has(s)) {
      return [false, `Target state '${s}' is not defined at top-level.`];
    }
  }

  return [true, ''];
};

const validateState = <V extends Transitions>(
  sm: MachineState<V>
): StateTarget => {
  if (typeof sm === 'undefined') throw new Error('sm parameter is undefined');
  if (typeof sm.value !== 'string') {
    throw new Error('Existing state is not a string');
  }
  return sm.states[sm.value];
};

/**
 * Attempts to transition to a new state. Either a new
 * `MachineState` is returned reflecting the change, or
 * an exception is thrown.
 * @param sm
 * @param toState
 * @returns
 */
export const to = <V extends Transitions>(
  sm: MachineState<V>,
  toState: StateNames<V>
): MachineState<V> => {
  validateState(sm);
  const [ok, msg, possibleStates] = validate(sm, toState);
  if (ok) {
    return Object.freeze({
      value: toState,
      states: sm.states,
      visited: pushUnique(sm.visited, [sm.value]),
    });
  } else {
    throw new Error(
      `${msg}: ${sm.value.toString()} -> ${toState.toString()}. Possible: ${possibleStates.join(
        ','
      )}`
    );
  }
};

/**
 * Returns _true_ if `toState` is a valid transition from current state of `sm`
 * @param sm
 * @param toState
 * @returns
 */
export const isValid = <V extends Transitions>(
  sm: MachineState<V>,
  toState: StateNames<V>
): boolean => {
  return validate(sm, toState)[0];
};

export const validate = <V extends Transitions>(
  sm: MachineState<V>,
  toState: StateNames<V>
): [error: boolean, reason: TransitionResult, possible: StateNames<V>[]] => {
  if (typeof toState !== 'string') {
    throw new Error('toState should be a string');
  }
  const toS = sm.states[toState];
  if (typeof toS === 'undefined') return [false, 'ToNotFound', []];

  const p = possible(sm);
  if (p.length === 0) return [false, 'Terminal', []];
  if (!p.includes(toState)) return [false, 'Invalid', p];

  return [true, 'Ok', p];
};

/**
 * Returns state transitions based on a list of strings.
 * The last string is the terminal state.
 *  A -> B -> C -> D
 *
 * ```js
 * const transitions = [`a`, `b`, `c`, `d`];
 * // Object state machine with events
 * const sm = new StateMachine.WithEvents(transitions);
 * // OR, immutable state machine
 * const sm = StateMachine.init(transitions);
 * ```
 * @param states List of states
 * @return MachineDescription
 */
export const fromList = (...states: readonly string[]): Transitions => {
  const t = {};
  if (!Array.isArray(states)) throw new Error(`Expected array of strings`);
  if (states.length <= 2) throw new Error(`Expects at least two states`);
  for (let i = 0; i < states.length; i++) {
    const s = states[i];
    if (typeof s !== `string`) {
      throw new Error(
        `Expected array of strings. Got type '${typeof s}' at index ${i}`
      );
    }
    if (i === states.length - 1) {
      /** @ts-ignore */
      //eslint-disable-next-line functional/immutable-data
      t[s] = null;
    } else {
      /** @ts-ignore */
      //eslint-disable-next-line functional/immutable-data
      t[s] = states[i + 1];
    }
  }
  return t;
};

/**
 * Returns a machine description based on a list of strings. Machine
 * can go back and forth between states:
 *  A <-> B <-> C <-> D
 * ```js
 * const transitions = [`a`, `b`, `c`, `d`];
 * // Object state machine with events
 * const sm = new StateMachine.WithEvents(transitions);
 * // OR, immutable state machine
 * const sm = StateMachine.init(transitions);
 * ```
 * @param states
 * @returns
 */
export const bidirectionalFromList = (
  ...states: readonly string[]
): Transitions => {
  const t = {};
  if (!Array.isArray(states)) throw new Error(`Expected array of strings`);
  if (states.length < 2) throw new Error(`Expects at least two states`);

  for (let i = 0; i < states.length; i++) {
    const s = states[i];
    if (typeof s !== `string`) {
      throw new Error(
        `Expected array of strings. Got type '${typeof s}' at index ${i}`
      );
    }

    /** @ts-ignore */
    //eslint-disable-next-line functional/immutable-data
    t[s] = [];
  }

  for (let i = 0; i < states.length; i++) {
    /** @ts-ignore */
    const v = t[states[i]] as string[];
    if (i === states.length - 1) {
      if (states.length > 1) {
        //eslint-disable-next-line functional/immutable-data
        v.push(states[i - 1]);
      } else {
        /** @ts-ignore */
        //eslint-disable-next-line functional/immutable-data
        t[states[i]] = null;
      }
    } else {
      //eslint-disable-next-line functional/immutable-data
      v.push(states[i + 1]);
      //eslint-disable-next-line functional/immutable-data
      if (i > 0) v.push(states[i - 1]);
    }
  }
  return t;
};

import { pushUnique } from '../IterableSync.js';
import { StateMachineWithEvents } from './StateMachineWithEvents.js';
export { StateMachineWithEvents as WithEvents };
