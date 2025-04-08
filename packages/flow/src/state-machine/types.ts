
export type {
  DriverOpts,
  StatesHandler as DriverHandler,
  Runner,
  ExpressionOrResult as DriverExpression,
  Result as DriverResult,
} from './driver.js';

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
  readonly hasPriorState: readonly StateNames<V>[];
  readonly isInState: StateNames<V>;
};

export type StateTargetStrict<V extends Transitions> = {
  readonly state: StateNames<V> | null;
  readonly preconditions?: readonly TransitionCondition<V>[];
};

/**
 * Possible state transitions, or _null_ if final state.
 */
//export type StateTarget<V extends Transitions> = StateTargetExt<V> | null;

export type StateTarget<V extends Transitions> =
  | string
  | string[]
  | readonly string[]
  | null
  | StateTargetStrict<V>;
// | StateTargetStrict<V>[]
// | readonly StateTargetStrict<V>[];

/**
 * Maps state to allowable next states
 */
export type Transitions = {
  readonly [ key: string ]: StateTarget<Transitions>;
};

export type TransitionsStrict = Readonly<Record<string, readonly StateTargetStrict<Transitions>[]>>;
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
  readonly visited: readonly StateNames<V>[];
  /**
   * Definition of state machine
   */
  readonly machine: Readonly<Record<StateNames<V>, readonly StateTargetStrict<V>[]>>;
};


export type StateEvent = (args: unknown, sender: any) => void;
export type StateHandler = string | StateEvent | null;

export interface State {
  readonly [event: string]: StateHandler;
}

// export interface MachineDescription {
//   readonly [key: string]: string | readonly string[] | null;
// }
