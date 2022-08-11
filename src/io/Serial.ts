import {JsonDevice, JsonDeviceOpts, JsonDeviceEvents, JsonDataEvent} from "./JsonDevice.js";

export {JsonDeviceEvents, JsonDeviceOpts, JsonDataEvent};

export type SerialOpts = JsonDeviceOpts & {
  readonly filters?:ReadonlyArray<SerialPortFilter>
  readonly baudRate?:number
  /**
   * End-of-line string sequence. \r\n by default.
   */
  readonly eol?:string
}

/**
 * Serial device. Assumes data is sent with new line characters (\r\n) between messages.
 * 
 * ```
 * const s = new Device();
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
  port:SerialPort|undefined;
  tx:WritableStreamDefaultWriter<string>|undefined;

  baudRate:number;

  constructor(private config:SerialOpts = {}) {
    super(config);

    const eol = config.eol ?? `\r\n`;

    this.baudRate = config.baudRate ?? 9600;
    if (config.name === undefined) super.name = `Serial.Device`;

    // Serial.println on microcontroller == \r\n
    this.rxBuffer.separator = eol;
  }

  /**
   * Writes text collected in buffer
   * @param txt 
   */
  protected async writeInternal(txt: string) {
    if (this.tx === undefined) throw new Error(`tx not ready`);
    try {
      this.tx.write(txt);
    } catch (ex:unknown) {
      this.warn(ex);
    }
  }

  onClosed(): void {
    try {
      this.port?.close();
    } catch (ex) {
      this.warn(ex);
    }
    this.states.state = `closed`; 
  }

  onPreConnect(): Promise<void> {
    return Promise.resolve();
  }

  async onConnectAttempt(): Promise<void> {
    //eslint-disable-next-line functional/no-let
    let reqOpts:SerialPortRequestOptions = { };
    const openOpts:SerialOptions = {
      baudRate: this.baudRate
    };

    if (this.config.filters) reqOpts = { filters: [...this.config.filters] };
    this.port = await navigator.serial.requestPort(reqOpts);

    this.port.addEventListener(`disconnect`, _ => {
      this.close();
    });

    await this.port.open(openOpts);

    const txW = this.port.writable;
    const txText = new TextEncoderStream();
    if (txW !== null) {
      txText.readable.pipeTo(txW);
      this.tx = txText.writable.getWriter();
    }

    const rxR = this.port.readable;
    const rxText = new TextDecoderStream();
    if (rxR !== null) {
      rxR.pipeTo(rxText.writable);
      rxText.readable.pipeTo(this.rxBuffer.writable());
    }
  }
}
