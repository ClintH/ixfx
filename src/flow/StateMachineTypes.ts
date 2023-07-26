export interface Options {
  readonly debug?: boolean;
}

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

export type StateEvent = (args: unknown, sender: any) => void;
export type StateHandler = string | StateEvent | null;

export interface State {
  readonly [event: string]: StateHandler;
}

export interface MachineDescription {
  readonly [key: string]: string | readonly string[] | null;
}

/**
 * State handler result. Steers the machine
 */
export type StateHandlerResult = {
  /**
   * Score of this result. This is used when a state
   * has multiple handlers returning results separately.
   */
  readonly score?: number;
  /**
   * If specified, the state to transition to.
   * This field is 2nd priority.
   */
  readonly state?: string;
  /**
   * If true, triggers next available state.
   * This flag is 1st priority.
   */
  readonly next?: boolean;
  /**
   * If true, resets the machine.
   * This flag is 3rd priority.
   */
  readonly reset?: boolean;
};

export type DriverExpression<V> = (args?: V) => StateHandlerResult | undefined;

export type DriverDescription<V> = {
  readonly select?: `first` | `highest` | `lowest`;
  readonly tryAll?: boolean;
  readonly expressions: DriverExpression<V> | readonly DriverExpression<V>[];
};
export interface StateDriverDescription<V> {
  readonly [key: string]:
    | DriverDescription<V>
    | readonly DriverExpression<V>[]
    | DriverExpression<V>;
}
