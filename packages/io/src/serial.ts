import {
  type JsonDeviceOpts,
  JsonDevice,
} from './json-device.js';

export type SerialOpts = JsonDeviceOpts & {
  readonly filters?: readonly SerialPortFilter[];
  readonly baudRate?: number;
  /**
   * End-of-line string sequence. \r\n by default.
   */
  readonly eol?: string;
};

/**
 * Serial device. Assumes data is sent with new line characters (\r\n) between messages.
 *
 * ```
 * import { Serial } from '@ixfx/io.js'
 * const s = new Serial.Device();
 * s.addEventListener(`change`, evt => {
 *  console.log(`State change ${evt.priorState} -> ${evt.newState}`);
 *  if (evt.newState === `connected`) {
 *    // Do something when connected...
 *  }
 * });
 *
 * // In a UI event handler...
 * s.connect();
 * ```
 *
 * Reading incoming data:
 * ```
 * // Parse incoming data as JSON
 * s.addEventListener(`data`, evt => {
 *  try {
 *    const o = JSON.parse(evt.data);
 *    // If we get this far, JSON is legit
 *  } catch (ex) {
 *  }
 * });
 * ```
 *
 * Writing to the microcontroller
 * ```
 * s.write(JSON.stringify({msg:"hello"}));
 * ```
 */
export class Device extends JsonDevice {
  port: SerialPort | undefined;
  tx: WritableStreamDefaultWriter<string> | undefined;
  abort: AbortController;
  baudRate: number;

  constructor(private config: SerialOpts = {}) {
    super(config);

    this.abort = new AbortController();

    const eol = config.eol ?? `\r\n`;

    this.baudRate = config.baudRate ?? 9600;
    if (config.name === undefined) this.name = `Serial.Device`;

    // Serial.println on microcontroller == \r\n
    this.rxBuffer.separator = eol;
  }

  /**
   * Writes text to the underlying output
   * @param txt
   */
  protected async writeInternal(txt: string) {
    if (typeof this.tx === `undefined`) throw new Error(`this.tx not ready`);
    try {
      await this.tx.write(txt);
    } catch (error: unknown) {
      this.warn(error);
    }
  }

  onClosed(): void {
    this.tx?.releaseLock();

    this.abort.abort(`closing port`);
    // try {
    //   this.port?.close();
    // } catch (ex) {
    //   this.warn(ex);
    // }
    this.states.state = `closed`;
  }

  onPreConnect(): Promise<void> {
    return Promise.resolve();
  }

  async onConnectAttempt(): Promise<void> {
    let reqOpts: SerialPortRequestOptions = {
      filters: []
    };
    const openOpts: SerialOptions = {
      baudRate: this.baudRate,
    };

    if (this.config.filters) reqOpts = { filters: [ ...this.config.filters ] };
    this.port = await navigator.serial.requestPort(reqOpts);

    this.port.addEventListener(`disconnect`, (_) => {
      void this.close();
    });

    await this.port.open(openOpts);

    const txW = this.port.writable as WritableStream<Uint8Array>;
    const txText = new TextEncoderStream();
    if (txW !== null) {
      txText.readable
        .pipeTo(txW, { signal: this.abort.signal })
        .catch((error: unknown) => {
          console.log(`Serial.onConnectAttempt txText pipe:`);
          console.log(error);
        });
      this.tx = txText.writable.getWriter();
    }

    const rxR = this.port.readable;
    const rxText = new TextDecoderStream();
    if (rxR !== null) {
      rxR
        .pipeTo(rxText.writable as WritableStream, { signal: this.abort.signal })
        .catch((error: unknown) => {
          console.log(`Serial.onConnectAttempt rxR pipe:`);
          console.log(error);
        });
      rxText.readable
        .pipeTo(this.rxBuffer.writable(), { signal: this.abort.signal })
        .catch((error: unknown) => {
          console.log(`Serial.onConnectAttempt rxText pipe:`);
          console.log(error);
          try {
            void this.port?.close();
          } catch (error) {
            console.log(error);
          }
        });
    }
  }
}

export { type JsonDeviceEvents, type JsonDataEvent, type JsonDeviceOpts } from './json-device.js';