import { type StateChangeEvent } from '../flow/StateMachineWithEvents.js';

import { type Transitions } from '../flow/StateMachine.js';
import type { genericStateTransitionsInstance } from './GenericStateTransitions.js';
export type IoDataEvent = {
  readonly data: string;
};

export type IoEvents<StateMachineTransitions extends Transitions> = {
  readonly data: IoDataEvent;
  readonly change: StateChangeEvent<StateMachineTransitions>;
};

//eslint-disable-next-line @typescript-eslint/naming-convention
export type GenericStateTransitions = Readonly<
  typeof genericStateTransitionsInstance
>;

export { type StateChangeEvent } from '../flow/StateMachineWithEvents.js';