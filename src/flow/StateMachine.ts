import { unique } from '../collections/arrays/index.js';



/**
 * State machine driver
 */
export { init as driver } from './StateMachineDriver.js';
export type {
  DriverOpts,
  StatesHandler as DriverHandler,
  Runner,
  ExpressionOrResult as DriverExpression,
  Result as DriverResult,
} from './StateMachineDriver.js';

/**
 * Transition result
 * * 'Ok': transition valid
 * * 'FromNotFound': the from state is missing from machine definition
 * * 'ToNotFound': the 'to' state is missing from machine definition
 * * 'Invalid': not allowed to transition to target state from the current state
 * * 'Terminal':  not allowed to transition because from state is the final state
 */
export type TransitionResult =
  | `Ok`
  | `FromNotFound`
  | `ToNotFound`
  | `Invalid`
  | `Terminal`;

export type TransitionCondition<V extends Transitions> = {
  readonly hasPriorState: ReadonlyArray<StateNames<V>>;
  readonly isInState: StateNames<V>;
};

export type StateTargetStrict<V extends Transitions> = {
  readonly state: StateNames<V> | null;
  readonly preconditions?: ReadonlyArray<TransitionCondition<V>>;
};

/**
 * Possible state transitions, or _null_ if final state.
 */
//export type StateTarget<V extends Transitions> = StateTargetExt<V> | null;

export type StateTarget<V extends Transitions> =
  | string
  //eslint-disable-next-line functional/prefer-readonly-type
  | Array<string>
  | ReadonlyArray<string>
  | null
  | StateTargetStrict<V>;
//eslint-disable-next-line functional/prefer-readonly-type
// | StateTargetStrict<V>[]
// | readonly StateTargetStrict<V>[];

/**
 * Maps state to allowable next states
 */
export type Transitions = {
  readonly [ key: string ]: StateTarget<Transitions>;
};

export type TransitionsStrict = Readonly<Record<string, ReadonlyArray<StateTargetStrict<Transitions>>>>;
/**
 * List of possible states
 */
export type StateNames<V extends Transitions> = keyof V & string;

export type Machine<V extends Transitions> = {
  /**
   * Allowable state transitions
   */
  readonly states: V;
};

/**
 * Encapsulation of a 'running' machine description and state.
 *
 * See:
 * - {@link cloneState}
 */
export type MachineState<V extends Transitions> = {
  /**
   * Current state
   */
  readonly value: StateNames<V>;
  /**
   * List of unique states visited. Won't contain the current
   * state unless it has already been visited.
   */
  readonly visited: ReadonlyArray<StateNames<V>>;

  //readonly machine: Machine<V>;
  readonly machine: {
    readonly [ key in StateNames<V> ]: ReadonlyArray<StateTargetStrict<V>>;
  };
};

/**
 * Clones machine state
 * @param toClone
 * @returns Cloned of `toClone`
 */
export const cloneState = <V extends Transitions>(
  toClone: MachineState<V>
): MachineState<V> => {
  return Object.freeze({
    value: toClone.value,
    visited: [ ...toClone.visited ],
    machine: toClone.machine,
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
 * let sm = StateMachine.init(descr);
 * // Move to 'shoes' state
 * sm = StateMachine.to(sm, 'shoes');
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
  stateMachine: Machine<V> | Transitions | TransitionsStrict,
  initialState?: StateNames<V>
): MachineState<V> => {
  const [ machine, machineValidationError ] = validateMachine(stateMachine);
  if (!machine) throw new Error(machineValidationError);

  const state: StateNames<V> =
    (initialState!) ?? Object.keys(machine.states)[ 0 ];
  if (machine.states[ state ] === undefined) {
    throw new TypeError(`Initial state not found`);
  }

  // Normalise states
  const transitions = validateAndNormaliseTransitions(machine.states);
  if (transitions === undefined) {
    throw new Error(`Could not normalise transitions`);
  }
  // @ts-expect-error
  return Object.freeze({
    value: state,
    visited: [],
    machine: Object.fromEntries(transitions),
  });
};

export const reset = <V extends Transitions>(
  sm: MachineState<V>
): MachineState<V> => {
  // @ts-expect-error
  return init<V>(sm.machine);
};

export const validateMachine = <V extends Transitions>(
  smOrTransitions: Machine<V> | Transitions | TransitionsStrict
): [ machine: Machine<V> | undefined, msg: string ] => {
  if (smOrTransitions === undefined) {
    return [ undefined, `Parameter undefined` ];
  }
  if (smOrTransitions === null) {
    return [ undefined, `Parameter null` ];
  }
  if (`states` in smOrTransitions) {
    // Assume Machine type
    return [ smOrTransitions as Machine<V>, `` ];
  }
  if (typeof smOrTransitions === `object`) {
    return [
      {
        // @ts-expect-error
        states: smOrTransitions,
      },
      ``,
    ];
  }
  return [
    undefined,
    `Unexpected type: ${ typeof smOrTransitions }. Expected object`,
  ];
};

// export const validateMachine = <V extends Transitions>(
//   sm: Machine<V>
// ): [machine: Machine<V> | undefined, msg: string] => {
//   if (typeof sm === 'undefined') {
//     return [undefined, `Parameter 'sm' is undefined`];
//   }
//   if (sm === null) return [undefined, `Parameter 'sm' is null`];
//   if (`states` in sm) {
//     const [transitions, validationError] = validateAndNormaliseTransitions(
//       sm.states
//     );
//     if (transitions) {
//       const machine: Machine<V> = {
//         // @ts-ignore
//         states: Object.fromEntries(transitions),
//       };
//       return [machine, ''];
//     } else {
//       return [undefined, validationError];
//     }
//   } else {
//     return [undefined, `Parameter 'sm.states' is undefined`];
//   }
// };

/**
 * Returns _true_ if `sm` is in its final state.
 * @param sm
 * @returns
 */
export const done = <V extends Transitions>(sm: MachineState<V>): boolean => {
  return possible(sm).length === 0;
};

/**
 * Returns a list of possible state targets for `sm`, or
 * an empty list if no transitions are possible.
 * @param sm
 * @returns
 */
export const possibleTargets = <V extends Transitions>(
  sm: MachineState<V>
): ReadonlyArray<StateTargetStrict<V>> => {
  // Validate current state
  validateMachineState(sm);
  // get list of possible targets
  const fromS = sm.machine[ sm.value ];

  if (fromS.length === 1 && fromS[ 0 ].state === null) return [];
  return fromS;
};

/**
 * Returns a list of possible state names for `sm`, or
 * an empty list if no transitions are possible.
 *
 * @param sm
 * @returns
 */
export const possible = <V extends Transitions>(
  sm: MachineState<V>
): Array<StateNames<V> | null> => {
  const targets = possibleTargets(sm);
  return targets.map((v) => v.state);
};

export const normaliseTargets = <V extends Transitions>(
  targets:
    | StateTarget<V>
    | ReadonlyArray<StateTargetStrict<V>>
    //eslint-disable-next-line functional/prefer-readonly-type
    | StateTargetStrict<V>
): Array<StateTargetStrict<V>> | null | undefined => {
  const normaliseSingleTarget = (
    target: string | undefined | null | object
  ): StateTargetStrict<V> | undefined => {
    // Terminal target
    if (target === null) return { state: null };
    // String is the target state
    if (typeof target === `string`) {
      return {
        state: target,
      };
    } else if (typeof target === `object` && `state` in target) {
      const targetState = target.state;
      if (typeof targetState !== `string`) {
        throw new TypeError(
          `Target 'state' field is not a string. Got: ${ typeof targetState }`
        );
      }
      if (`preconditions` in target) {
        return {
          state: targetState,
          preconditions: target.preconditions as Array<TransitionCondition<V>>,
        };
      }
      return { state: targetState };
    } else {
      throw new Error(
        `Unexpected type: ${ typeof target }. Expected string or object with 'state' field.`
      );
    }
  };

  // Array of targets (either strings or objects)
  if (Array.isArray(targets)) {
    //eslint-disable-next-line functional/no-let
    let containsNull = false;
    const mapResults = targets.map((t) => {
      const r = normaliseSingleTarget(t);
      if (!r) throw new Error(`Invalid target`);
      containsNull = containsNull || r.state === null;
      return r;
    });
    if (containsNull && mapResults.length > 1) {
      throw new Error(`Cannot have null as an possible state`);
    }
    return mapResults;
  } else {
    const target = normaliseSingleTarget(targets);
    if (!target) return;
    return [ target ];
  }
};

const validateAndNormaliseTransitions = (
  d: Transitions
): Map<string, Array<StateTargetStrict<typeof d>>> | undefined => {
  const returnMap = new Map<string, Array<StateTargetStrict<typeof d>>>();

  // 1. Index top-level states
  for (const [ topLevelState, topLevelTargets ] of Object.entries(d)) {
    if (typeof topLevelState === `undefined`) {
      throw new TypeError(`Top-level undefined state`);
    }
    if (typeof topLevelTargets === `undefined`) {
      throw new TypeError(`Undefined target state for ${ topLevelState }`);
    }
    if (returnMap.has(topLevelState)) {
      throw new Error(`State defined twice: ${ topLevelState }`);
    }
    if (topLevelState.includes(` `)) {
      throw new Error(`State names cannot contain spaces`);
    }
    returnMap.set(topLevelState, []);
  }

  // 2. Normalise target
  for (const [ topLevelState, topLevelTargets ] of Object.entries(d)) {
    const targets = normaliseTargets(topLevelTargets);
    if (targets === undefined) throw new Error(`Could not normalise target`);
    if (targets !== null) {
      // Check that they all exist as top-level states
      const seenStates = new Set();
      for (const target of targets) {
        if (seenStates.has(target.state)) {
          throw new Error(
            `Target state '${ target.state }' already exists for '${ topLevelState }'`
          );
        }
        seenStates.add(target.state);
        if (target.state === null) continue;
        if (!returnMap.has(target.state)) {
          throw new Error(
            `Target state '${ target.state }' is not defined as a top-level state. Defined under: '${ topLevelState }'`
          );
        }
      }
      returnMap.set(topLevelState, targets);
    }
  }
  return returnMap;
};

/**
 * Validates machine state, throwing an exception if not valid
 * and returning `StateTargetStrict`
 * @param state
 * @returns
 */
const validateMachineState = <V extends Transitions>(
  state: MachineState<V>
): void => {
  if (state === undefined) {
    throw new TypeError(`Parameter 'state' is undefined`);
  }
  if (typeof state.value !== `string`) {
    throw new TypeError(`Existing state is not a string`);
  }
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
  validateMachineState(sm); // throws if not OK
  validateTransition(sm, toState); // throws if not OK
  return Object.freeze({
    value: toState,
    machine: sm.machine,
    visited: unique<string>([ sm.visited as Array<string>, [ sm.value ] as Array<string> ]),
  });
};

export const next = <V extends Transitions>(
  sm: MachineState<V>
): MachineState<V> => {
  //validateMachineState(sm);
  const first = possibleTargets(sm).at(0);
  if (!first || first.state === null) {
    throw new Error(
      `Not possible to move to a next state from '${ sm.value }`
    );
  }
  return to(sm, first.state);
};

/**
 * Returns _true_ if `toState` is a valid transition from current state of `sm`
 * @param sm
 * @param toState
 * @returns
 */
export const isValidTransition = <V extends Transitions>(
  sm: MachineState<V>,
  toState: StateNames<V>
): boolean => {
  try {
    validateTransition(sm, toState);
    return true;
  } catch {
    return false;
  }
};

export const validateTransition = <V extends Transitions>(
  sm: MachineState<V>,
  toState: StateNames<V>
): void => {
  if (toState === null) throw new Error(`Cannot transition to null state`);
  if (toState === undefined) {
    throw new Error(`Cannot transition to undefined state`);
  }
  if (typeof toState !== `string`) {
    throw new TypeError(
      `Parameter 'toState' should be a string. Got: ${ typeof toState }`
    );
  }

  //const toS = sm.machine[toState];
  //if (typeof toS === 'undefined') throw new Error(`Target state '${toState}' not defined`);

  const p = possible(sm);
  if (p.length === 0) throw new Error(`Machine is in terminal state`);
  if (!p.includes(toState)) {
    throw new Error(
      `Target state '${ toState }' not available at current state '${ sm.value
      }'. Possible states: ${ p.join(`, `) }`
    );
  }
};

/**
 * Returns state transitions based on a list of strings.
 * The last string is the terminal state.
 *  A -> B -> C -> D
 * 
 * See also: {@link fromListBidirectional}
 *
 * ```js
 * const transitions = fromList([`a`, `b`, `c`, `d`]);
 * // Object state machine with events
 * const sm = new StateMachine.WithEvents(transitions);
 * // OR, immutable state machine
 * const sm = StateMachine.init(transitions);
 * ```
 * @param states List of states
 * @return MachineDescription
 */
export const fromList = (...states: ReadonlyArray<string>): Transitions => {
  const t = {};
  if (!Array.isArray(states)) throw new Error(`Expected array of strings`);
  if (states.length <= 2) throw new Error(`Expects at least two states`);
  for (let index = 0; index < states.length; index++) {
    const s = states[ index ];
    if (typeof s !== `string`) {
      throw new TypeError(
        `Expected array of strings. Got type '${ typeof s }' at index ${ index }`
      );
    }
    // @ts-expect-error
    t[ s ] = index === states.length - 1 ? null : states[ index + 1 ];
  }
  return t;
};

/**
 * Returns a machine description based on a list of strings. Machine
 * can go back and forth between states:
 *  A <-> B <-> C <-> D
 * 
 * See also {@link fromList}.
 * 
 * ```js
 * const transitions = fromListBidirectional([`a`, `b`, `c`, `d`]);
 * // Object state machine with events
 * const sm = new StateMachine.WithEvents(transitions);
 * // OR, immutable state machine
 * const sm = StateMachine.init(transitions);
 * ```
 * @param states
 * @returns
 */
export const fromListBidirectional = (
  ...states: ReadonlyArray<string>
): Transitions => {
  const t = {};
  if (!Array.isArray(states)) throw new Error(`Expected array of strings`);
  if (states.length < 2) throw new Error(`Expects at least two states`);

  for (const [ index, s ] of states.entries()) {
    if (typeof s !== `string`) {
      throw new TypeError(
        `Expected array of strings. Got type '${ typeof s }' at index ${ index }`
      );
    }

    /** @ts-expect-error */
    //eslint-disable-next-line functional/immutable-data
    t[ s ] = [];
  }

  for (let index = 0; index < states.length; index++) {
    /** @ts-expect-error */
    const v = t[ states[ index ] ] as Array<string>;
    if (index === states.length - 1) {
      if (states.length > 1) {
        //eslint-disable-next-line functional/immutable-data
        v.push(states[ index - 1 ]);
      } else {
        /** @ts-expect-error */
        //eslint-disable-next-line functional/immutable-data
        t[ states[ index ] ] = null;
      }
    } else {
      //eslint-disable-next-line functional/immutable-data
      v.push(states[ index + 1 ]);
      //eslint-disable-next-line functional/immutable-data
      if (index > 0) v.push(states[ index - 1 ]);
    }
  }
  return t;
};

export { StateMachineWithEvents as WithEvents, type Opts as StateMachineWithEventsOpts, type StateMachineEventMap, type StopEvent } from './StateMachineWithEvents.js';