import { SimpleEventEmitter } from '@ixfx/events';
import { StateMachineWithEvents, type StateChangeEvent } from '@ixfx/flow/state-machine';
//import { type StateChangeEvent } from '../flow/StateMachineWithEvents.js';
import { indexOfCharCode, omitChars } from '@ixfx/core/text';
import { retryFunction } from '@ixfx/flow';
import { Codec } from './codec.js';
import { StringReceiveBuffer } from './string-receive-buffer.js';
import { StringWriteBuffer } from './string-write-buffer.js';
import {
  type GenericStateTransitions,
} from './types.js';
import { genericStateTransitionsInstance } from './generic-state-transitions.js';

/**
 * Options for JsonDevice
 */
export type JsonDeviceOpts = {
  /**
   * How much data to transfer at a time
   */
  readonly chunkSize?: number;
  /**
   * Name of device. This is only used for assisting the console.log output
   */
  readonly name?: string;
  /**
   * Number of times to automatically try to reconnect
   */
  readonly connectAttempts?: number;
  /**
   * If true, additional logging will be done
   */
  readonly debug?: boolean;
};

/**
 * Data received event
 */
export type JsonDataEvent = {
  /**
   * Data received
   */
  readonly data: string;
};

/**
 * Events emitted by JsonDevice
 */
export type JsonDeviceEvents = {
  /**
   * Data received
   */
  readonly data: JsonDataEvent;
  /**
   * State changed
   */
  readonly change: StateChangeEvent<GenericStateTransitions>;
};

export abstract class JsonDevice extends SimpleEventEmitter<JsonDeviceEvents> {
  states: StateMachineWithEvents<GenericStateTransitions>;
  codec: Codec;

  verboseLogging = false;
  name: string;
  connectAttempts: number;
  chunkSize: number;

  rxBuffer: StringReceiveBuffer;
  txBuffer: StringWriteBuffer;

  constructor(config: JsonDeviceOpts = {}) {
    super();

    // Init
    this.verboseLogging = config.debug ?? false;
    this.chunkSize = config.chunkSize ?? 1024;
    this.connectAttempts = config.connectAttempts ?? 3;
    this.name = config.name ?? `JsonDevice`;

    // Transmit buffer
    this.txBuffer = new StringWriteBuffer(async (data) => {
      // When we have data to actually write to device

      await this.writeInternal(data);
    }, config);

    // Receive buffer
    this.rxBuffer = new StringReceiveBuffer((line) => {
      this.fireEvent(`data`, { data: line });
    });

    this.codec = new Codec();
    this.states = new StateMachineWithEvents(genericStateTransitionsInstance, {
      initial: `ready`,
    });

    this.states.addEventListener(`change`, (event) => {
      this.fireEvent(`change`, event);
      this.verbose(`${ event.priorState } -> ${ event.newState }`);
      if (event.priorState === `connected`) {
        // Clear out buffers
        this.rxBuffer.clear();
        this.txBuffer.clear();
      }
    });
  }

  get isConnected(): boolean {
    return this.states.state === `connected`;
  }

  get isClosed(): boolean {
    return this.states.state === `closed`;
  }

  write(txt: string): void {
    if (this.states.state !== `connected`) {
      throw new Error(`Cannot write while state is ${ this.states.state }`);
    }
    this.txBuffer.add(txt);
  }

  /**
   * Writes text to output device
   * @param txt
   */
  protected abstract writeInternal(txt: string): Promise<void>;


  // eslint-disable-next-line @typescript-eslint/require-await
  async close(): Promise<void> {
    if (this.states.state !== `connected`) return;

    // console.log(`rxBuffer closing`);
    // try {
    //   await this.rxBuffer.close();
    // } catch (e) {
    //   console.warn(e);
    // }

    // console.log(`txBuffer closing`);
    // try {
    //   await this.txBuffer.close();
    // } catch (e) {
    //   console.warn(e);
    // }

    // console.log(`calling onClose`);

    this.onClosed();
  }

  /**
   * Must change state
   */
  abstract onClosed(): void;

  abstract onPreConnect(): Promise<void>;

  async connect(): Promise<void> {
    const attempts = this.connectAttempts;

    this.states.state = `connecting`;
    await this.onPreConnect();

    await retryFunction(
      async () => {
        await this.onConnectAttempt();
        this.states.state = `connected`;
        return true;
      },
      {
        limitAttempts: attempts,
        startAt: 200,
      }
    );
  }

  /**
   * Should throw if did not succeed.
   */
  protected abstract onConnectAttempt(): Promise<void>;

  private onRx(event: Event) {
    //const rx = this.rx;
    //if (rx === undefined) return;


    const view = (event.target as any).value as DataView;
    if (view === undefined) return;

    let string_ = this.codec.fromBuffer(view.buffer as ArrayBuffer);

    // Check for flow control chars
    const plzStop = indexOfCharCode(string_, 19);
    const plzStart = indexOfCharCode(string_, 17);

    // Remove if found
    if (plzStart && plzStop < plzStart) {
      this.verbose(`Tx plz start`);
      string_ = omitChars(string_, plzStart, 1);
      this.txBuffer.paused = false;
    }
    if (plzStop && plzStop > plzStart) {
      this.verbose(`Tx plz stop`);
      string_ = omitChars(string_, plzStop, 1);
      this.txBuffer.paused = true;
    }

    this.rxBuffer.add(string_);
  }

  protected verbose(m: string): void {
    if (this.verboseLogging) console.info(this.name, m);
  }

  protected log(m: string): void {
    console.log(this.name, m);
  }

  protected warn(m: unknown): void {
    console.warn(this.name, m);
  }
}
