import { SimpleEventEmitter } from '../Events.js';
import { type StateChangeEvent, StateMachine } from '../flow/StateMachine.js';
import { indexOfCharCode, omitChars } from '../Text.js';
import { Codec } from './Codec.js';
import { StringReceiveBuffer } from './StringReceiveBuffer.js';
import { StringWriteBuffer } from './StringWriteBuffer.js';
import { retryWithBackOff } from '../flow/RetryWithBackOff.js';

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
  readonly change: StateChangeEvent;
};

export abstract class JsonDevice extends SimpleEventEmitter<JsonDeviceEvents> {
  states: StateMachine;
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
    }, config.chunkSize);

    // Receive buffer
    this.rxBuffer = new StringReceiveBuffer((line) => {
      this.fireEvent(`data`, { data: line });
    });

    this.codec = new Codec();
    this.states = new StateMachine(`ready`, {
      ready: `connecting`,
      connecting: [`connected`, `closed`],
      connected: [`closed`],
      closed: `connecting`,
    });

    this.states.addEventListener(`change`, (evt) => {
      this.fireEvent(`change`, evt);
      this.verbose(`${evt.priorState} -> ${evt.newState}`);
      if (evt.priorState === `connected`) {
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

  write(txt: string) {
    if (this.states.state !== `connected`) {
      throw new Error(`Cannot write while state is ${this.states.state}`);
    }
    this.txBuffer.add(txt);
  }

  /**
   * Writes text to output device
   * @param txt
   */
  protected abstract writeInternal(txt: string): void;

  async close() {
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

  async connect() {
    const attempts = this.connectAttempts;

    this.states.state = `connecting`;
    await this.onPreConnect();

    await retryWithBackOff(
      async () => {
        await this.onConnectAttempt();
        this.states.state = `connected`;
        return true;
      },
      {
        count:attempts,
        startMs:200
      }
    );
  }

  /**
   * Should throw if did not succeed.
   */
  protected abstract onConnectAttempt(): Promise<void>;

  private onRx(evt: Event) {
    //const rx = this.rx;
    //if (rx === undefined) return;

    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const view = (evt.target as any).value as DataView;
    if (view === undefined) return;

    //eslint-disable-next-line functional/no-let
    let str = this.codec.fromBuffer(view.buffer);

    // Check for flow control chars
    const plzStop = indexOfCharCode(str, 19);
    const plzStart = indexOfCharCode(str, 17);

    // Remove if found
    if (plzStart && plzStop < plzStart) {
      this.verbose(`Tx plz start`);
      str = omitChars(str, plzStart, 1);
      this.txBuffer.paused = false;
    }
    if (plzStop && plzStop > plzStart) {
      this.verbose(`Tx plz stop`);
      str = omitChars(str, plzStop, 1);
      this.txBuffer.paused = true;
    }

    this.rxBuffer.add(str);
  }

  protected verbose(m: string) {
    if (this.verboseLogging) console.info(`${this.name} `, m);
  }

  protected log(m: string) {
    console.log(`${this.name} `, m);
  }

  protected warn(m: unknown) {
    console.warn(`${this.name} `, m);
  }
}
