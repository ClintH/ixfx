import { type EvalOpts, type Options, deviceEval } from './Espruino.js';
import { NordicBleDevice } from './NordicBleDevice.js';

/**
 * An Espruino BLE-connection
 *
 * See [online demos](https://clinth.github.io/ixfx-demos/io/)
 *
 * Use the `puck` function to initialise and connect to a Puck.js.
 * It must be called in a UI event handler for browser security reasons.
 *
 * ```js
 * import { Espruino } from 'https://unpkg.com/ixfx/dist/io.js'
 * const e = await Espruino.puck();
 * ```
 *
 * To connect to a particular device:
 *
 * ```js
 * import { Espruino } from 'https://unpkg.com/ixfx/dist/io.js'
 * const e = await Espruino.puck({name:`Puck.js a123`});
 * ```
 *
 * Listen for events:
 * ```js
 * // Received something
 * e.addEventListener(`data`, d => console.log(d.data));
 * // Monitor connection state
 * e.addEventListener(`change`, c => console.log(`${d.priorState} -> ${d.newState}`));
 * ```
 *
 * Write to the device (note the \n for a new line at the end of the string). This will
 * execute the code on the Espruino.
 *
 * ```js
 * e.write(`digitalPulse(LED1,1,[10,500,10,500,10]);\n`);
 * ```
 *
 * Run some code and return result:
 * ```js
 * const result = await e.eval(`2+2\n`);
 * ```
 */
export class EspruinoBleDevice extends NordicBleDevice {
  evalTimeoutMs: number;
  evalReplyBluetooth = true;

  /**
   * Creates instance. You probably would rather use {@link puck} to create.
   * @param device
   * @param opts
   */
  constructor(device: BluetoothDevice, opts: Options = {}) {
    super(device, opts);
    this.evalTimeoutMs = opts.evalTimeoutMs ?? 5 * 1000;
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
  async writeScript(code: string) {
    this.write(`\x03\x10reset();\n`);
    this.write(`\x10${code}\n`);
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
   *  assumeExclusive If true, eval assumes all replies from controller are in response to eval. True by default
   *  debug: If true, execution is traced via `warn` callback
   * @param code Code to run on the Espruino.
   * @param opts Options
   * @param warn Function to pass warning/trace messages to. If undefined, this.warn is used, printing to console.
   */
  async eval(
    code: string,
    opts: EvalOpts = {},
    warn?: (msg: string) => void
  ): Promise<string> {
    const debug = opts.debug ?? false;
    const warnCb = warn ?? ((m) => this.warn(m));
    return deviceEval(code, opts, this, `Bluetooth.println`, debug, warnCb);
  }
  /*
    const timeoutMs = opts.timeoutMs ?? this.evalTimeoutMs;
    const assumeExclusive = opts.assumeExclusive ?? true;

    if (typeof code !== `string`) throw new Error(`code parameter should be a string`);
      
    return new Promise((resolve, reject) => {
      // Generate a random id so reply can be matched up with this request
      const id = randomString(5);

      const onData = (d:DataEvent) => {
        try {
          // Parse reply, expecting JSON.
          const dd = JSON.parse(d.data);

          // Check for reply field, and that it matches
          if (`reply` in dd) {
            if (dd.reply === id) {
              done(); // Stop waiting for result
              if (`result` in dd) {
                resolve(dd.result);
              }
            } else {
              this.warn(`Expected reply ${id}, got ${dd.reply}`);
            }
          }
        } catch (ex:unknown) {
          // If there was a syntax error, response won't be JSON
          if (assumeExclusive) {
            // Fail with unexpected reply as the message
            done(d.data);
          } else {
            // Unexpected reply, but we cannot be sure if it's in response to eval or
            // some other code running on board. So just warn and eventually timeout
            this.warn(ex);
          }
        }
      };

      const onStateChange = (e:StateChangeEvent) => {
        if (e.newState !== `connected`) done(`State changed to '${e.newState}', aborting`);
      };

      this.addEventListener(`data`, onData);
      this.addEventListener(`change`, onStateChange);

      // Init waitFor
      const done = waitFor(timeoutMs, (reason:string) => {
        reject(reason);
      }, () => {
        // If we got a response or there was a timeout, remove event listeners
        this.removeEventListener(`data`, onData);
        this.removeEventListener(`change`, onStateChange);
      });

      this.write(`\x10Bluetooth.println(JSON.stringify({reply:"${id}", result:JSON.stringify(${code})}))\n`);
    });
  */
}
