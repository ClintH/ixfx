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

export type DriverResult = {
  readonly score?: number;
  readonly state?: string;
  readonly next?: boolean;
  readonly reset?: boolean;
};

export type DriverExpression<V> = (args?: V) => DriverResult | undefined;

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
