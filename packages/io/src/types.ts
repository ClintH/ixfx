import { type StateChangeEvent } from '@ixfx/flow/state-machine';
import { type Transitions } from '@ixfx/flow/state-machine';
import type { genericStateTransitionsInstance } from './generic-state-transitions.js';

export { type StateChangeEvent } from '@ixfx/flow/state-machine';

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


export type FrameProcessorSources = `` | `camera` | `video`;