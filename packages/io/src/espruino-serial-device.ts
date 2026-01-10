import { deviceEval, type EvalOpts } from './espruino.js';
import { Device as SerialDevice, type SerialOpts } from './serial.js';

export type EspruinoSerialDeviceOpts = SerialOpts & {
  readonly evalTimeoutMs?: number;
};

export class EspruinoSerialDevice extends SerialDevice {
  evalTimeoutMs: number;
  evalReplyBluetooth = false;

  constructor(opts?: EspruinoSerialDeviceOpts) {
    super(opts);

    if (opts === undefined) opts = {};
    this.evalTimeoutMs = opts.evalTimeoutMs ?? 5 * 1000;
  }

  async disconnect(): Promise<void> {
    return super.close();
  }

  /**
   * Writes a script to Espruino.
   *
   * It will first send a CTRL+C to cancel any previous input, `reset()` to clear the board,
   * and then the provided `code` followed by a new line.
   *
   * Use {@link eval} instead to execute remote code and get the result back.
   *
   * ```js
   * // Eg from https://www.espruino.com/Web+Bluetooth
   * writeScript(`
   *  setInterval(() => Bluetooth.println(E.getTemperature()), 1000);
   *  NRF.on('disconnect',()=>reset());
   * `);
   * ```
   *
   * @param code Code to send. A new line is added automatically.
   */
  writeScript(code: string): void {
    this.write(`\u0003\u0010reset();\n`);
    this.write(`\u0010${ code }\n`);
  }

  /**
   * Sends some code to be executed on the Espruino. The result
   * is packaged into JSON and sent back to your code. An exception is
   * thrown if code can't be executed for some reason.
   *
   * ```js
   * const sum = await e.eval(`2+2`);
   * ```
   *
   * It will wait for a period of time for a well-formed response from the
   * Espruino. This might not happen if there is a connection problem
   * or a syntax error in the code being evaled. In cases like the latter,
   * it will take up to `timeoutMs` (default 5 seconds) before we give up
   * waiting for a correct response and throw an error.
   *
   * Tweaking of the timeout may be required if `eval()` is giving up too quickly
   * or too slowly. A default timeout can be given when creating the class.
   *
   * Options:
   *  timeoutMs: Timeout for execution. 5 seconds by default
   *  assumeExclusive: If true, eval assumes all replies from controller are in response to eval. True by default
   *  debug: If true, execution is traced via `warn` callback
   * @param code Code to run on the Espruino.
   * @param opts Options
   * @param warn Function to pass warning/trace messages to. If undefined, this.warn is used, printing to console.
   */
  async eval(
    code: string,
    opts: EvalOpts = {},
    warn?: (message: string) => void
  ): Promise<string> {
    const debug = opts.debug ?? false;
    const warner = warn ?? ((m) => { this.warn(m); });

    return deviceEval(code, opts, this, `USB.println`, debug, warner);
  }
}
