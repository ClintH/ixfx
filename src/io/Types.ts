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


export type GenericStateTransitions = Readonly<
  typeof genericStateTransitionsInstance
>;

export type BleDeviceOptions = {
  readonly service: string;
  readonly rxGattCharacteristic: string;
  readonly txGattCharacteristic: string;
  readonly chunkSize: number;
  readonly name: string;
  readonly connectAttempts: number;
  readonly debug: boolean;
};
export { type StateChangeEvent } from '../flow/StateMachineWithEvents.js';

export type FrameProcessorSources = `` | `camera` | `video`;