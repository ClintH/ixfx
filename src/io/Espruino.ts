import { EspruinoBleDevice } from './EspruinoBleDevice.js';
import { defaultOpts as NordicDefaults } from './NordicBleDevice.js';
import { type StateChangeEvent } from '../flow/StateMachineWithEvents.js';
import { type ISimpleEventEmitter } from '../ISimpleEventEmitter.js';
import { string as randomString } from '../Random.js';
import { waitFor } from '../flow/WaitFor.js';
import {
  EspruinoSerialDevice,
  type EspruinoSerialDeviceOpts,
} from './EspruinoSerialDevice.js';
import type {
  GenericStateTransitions,
  IoDataEvent,
  IoEvents,
} from './index.js';

export { EspruinoBleDevice, EspruinoSerialDevice };
export type { EspruinoSerialDeviceOpts };

export type EspruinoStates =
  | `ready`
  | `connecting`
  | `connected`
  | `closed`
  | `closing`
  | `connecting`;

/**
 * Options for device
 */
export type Options = {
  /**
   * Default milliseconds to wait before giving up on a well-formed reply. 5 seconds is the default.
   */
  readonly evalTimeoutMs?: number;
  /**
   * Name of device. Only used for printing log mesages to the console
   */
  readonly name?: string;

  /**
   * If true, additional logging information is printed
   */
  readonly debug?: boolean;
};

/**
 * Options for code evaluation
 */
export type EvalOpts = {
  /**
   * Milliseconds to wait before giving up on well-formed reply. 5 seconds is the default.
   */
  readonly timeoutMs?: number;
  /**
   * If true (default), it assumes that anything received from the board
   * is a response to the eval
   */
  readonly assumeExclusive?: boolean;

  /**
   * If true, executed code is traced
   */
  readonly debug?: boolean;
};

export type EspruinoBleOpts = {
  /**
   * If the name is specified, this value is used
   * for filtering Bluetooth devices
   */
  readonly name?: string;
  /**
   * If true, additional logging messages are
   * displayed on the console
   */
  readonly debug?: boolean;
  /**
   * If specified, these filtering options are used instead
   */
  readonly filters?: readonly BluetoothLEScanFilter[];
};

/**
 * Instantiates a Puck.js. See {@link EspruinoBleDevice} for more info.
 * [Online demos](https://clinth.github.io/ixfx-demos/io/)
 *
 * If `opts.name` is specified, this will the the Bluetooth device sought.
 *
 * ```js
 * import { Espruino } from 'https://unpkg.com/ixfx/dist/io.js'
 * const e = await Espruino.puck({ name:`Puck.js a123` });
 * ```
 *
 * If no name is specified, a list of all devices starting with `Puck.js` are shown.
 *
 * To get more control over filtering, pass in `opts.filter`. `opts.name` is not used as a filter in this scenario.
 *
 * ```js
 * import { Espruino } from 'https://unpkg.com/ixfx/dist/io.js'
 * const filters = [
 *  { namePrefix: `Puck.js` },
 *  { namePrefix: `Pixl.js` },
 *  {services: [NordicDefaults.service] }
 * ]
 * const e = await Espruino.puck({ filters });
 * ```
 *
 * @returns Returns a connected instance, or throws exception if user cancelled or could not connect.
 */
export const puck = async (opts: EspruinoBleOpts = {}) => {
  const name = opts.name ?? `Puck`;
  const debug = opts.debug ?? false;

  const device = await navigator.bluetooth.requestDevice({
    filters: getFilters(opts),
    optionalServices: [NordicDefaults.service],
  });

  console.log(device.name);
  const d = new EspruinoBleDevice(device, { name, debug });
  await d.connect();
  return d;
};

/**
 * Create a serial-connected Espruino device.
 *
 * ```js
 * import { Espruino } from 'https://unpkg.com/ixfx/dist/io.js'
 * const e = await Espruio.serial();
 * e.connect();
 * ```
 *
 * Options:
 * ```js
 * import { Espruino } from 'https://unpkg.com/ixfx/dist/io.js'
 * const e = await Espruino.serial({ debug: true, evalTimeoutMs: 1000, name: `My Pico` });
 * e.connect();
 * ```
 *
 * Listen for events:
 * ```js
 * e.addEventListener(`change`, evt => {
 *  console.log(`State change ${evt.priorState} -> ${evt.newState}`);
 *  if (evt.newState === `connected`) {
 *    // Do something when connected...
 *  }
 * });
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
 * @param opts
 * @returns Returns a connected instance, or throws exception if user cancelled or could not connect.
 */
export const serial = async (
  opts: {
    readonly name?: string;
    readonly debug?: boolean;
    readonly evalTimeoutMs?: number;
  } = {}
) => {
  const d = new EspruinoSerialDevice(opts);
  await d.connect();
  return d;
};

/**
 * Returns a list of BLE scan filters, given the
 * connect options.
 * @param opts
 * @returns
 */
const getFilters = (opts: EspruinoBleOpts) => {
  //eslint-disable-next-line functional/no-let
  const filters: BluetoothLEScanFilter[] = [];

  if (opts.filters) {
    //eslint-disable-next-line functional/immutable-data
    filters.push(...opts.filters);
  } else if (opts.name) {
    // Name filter
    //eslint-disable-next-line functional/immutable-data
    filters.push({ name: opts.name });
    console.info(`Filtering Bluetooth devices by name '${opts.name}'`);
  } else {
    // Default filter
    //eslint-disable-next-line functional/immutable-data
    filters.push({ namePrefix: `Puck.js` });
  }
  // {namePrefix: 'Pixl.js'},
  // {namePrefix: 'MDBT42Q'},
  // {namePrefix: 'RuuviTag'},
  // {namePrefix: 'iTracker'},
  // {namePrefix: 'Thingy'},
  // {namePrefix: 'Espruino'},
  //{services: [NordicDefaults.service]}

  return filters;
};
/**
 * Connects to a generic Espruino BLE device. See  {@link EspruinoBleDevice} for more info.
 * Use {@link puck} if you're connecting to a Puck.js
 *
 * If `opts.name` is specified, only this BLE device will be shown.
 * ```js
 * const e = await connectBle({ name: `Puck.js a123` });
 * ```
 *
 * `opts.filters` overrides and sets arbitary filters.
 *
 * ```js
 * import { Espruino } from 'https://unpkg.com/ixfx/dist/io.js'
 * const filters = [
 *  { namePrefix: `Puck.js` },
 *  { namePrefix: `Pixl.js` },
 *  {services: [NordicDefaults.service] }
 * ]
 * const e = await Espruino.connectBle({ filters });
 * ```
 *
 * @returns Returns a connected instance, or throws exception if user cancelled or could not connect.
 */
export const connectBle = async (opts: EspruinoBleOpts = {}) => {
  const device = await navigator.bluetooth.requestDevice({
    filters: getFilters(opts),
    optionalServices: [NordicDefaults.service],
  });
  const d = new EspruinoBleDevice(device, { name: `Espruino` });
  await d.connect();
  return d;
};

export type Events = IoEvents<GenericStateTransitions>;
/**
 * EspruinoDevice
 *
 * This base interface is implemented by {@link EspruinoBleDevice} and {@link EspruinoSerialDevice}.
 */
export interface EspruinoDevice extends ISimpleEventEmitter<Events> {
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
  eval(
    code: string,
    opts?: EvalOpts,
    warn?: (msg: string) => void
  ): Promise<string>;

  /**
   * Write some code for immediate execution. This is a lower-level
   * alternative to {@link writeScript}. Be sure to include a new line character '\n' at the end.
   * @param m Code
   */
  write(m: string): void;

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
   * espruino.writeScript(`
   *  setInterval(() => Bluetooth.println(E.getTemperature()), 1000);
   *  NRF.on('disconnect',()=>reset());
   * `);
   * ```
   *
   * @param code Code to send. A new line is added automatically.
   */
  writeScript(code: string): void;

  /**
   * Disconnect
   */
  disconnect(): void;

  /**
   * Gets the current evaluation (millis)
   */
  get evalTimeoutMs(): number;

  get isConnected(): boolean;
}

/**
 * Evaluates some code on an Espruino device.
 *
 * Options:
 * * timeoutMs: how many millis to wait before assuming code failed. If not specified, `device.evalTimeoutMs` is used as a default.
 * * assumeExlusive: assume device is not producing any other output than for our evaluation
 *
 * A random string is created to pair eval requests and responses. `code` will be run on the device, with the result
 * wrapped in JSON, and in turn wrapped in a object that is sent back.
 *
 * The actual code that gets sent to the device is then:
 * `\x10${evalReplyPrefix}(JSON.stringify({reply:"${id}", result:JSON.stringify(${code})}))\n`
 *
 * For example, it might end up being:
 * `\x10Bluetooth.println(JSON.stringify({reply: "a35gP", result: "{ 'x': '10' }" }))\n`
 *
 * @param code Code to evaluation
 * @param opts Options for evaluation
 * @param device Device to execute on
 * @param evalReplyPrefix How to send code back (eg `Bluetooth.println`, `console.log`)
 * @param debug If true, the full evaled code is printed locally to the console
 * @param warn Callback to display warnings
 * @returns
 */
export const deviceEval = async (
  code: string,
  opts: EvalOpts = {},
  device: EspruinoDevice,
  evalReplyPrefix: string,
  debug: boolean,
  warn: (m: string) => void
): Promise<string> => {
  const timeoutMs = opts.timeoutMs ?? device.evalTimeoutMs;
  const assumeExclusive = opts.assumeExclusive ?? true;

  if (typeof code !== `string`) {
    throw new Error(`code parameter should be a string`);
  }

  return new Promise((resolve, reject) => {
    // Generate a random id so reply can be matched up with this request
    const id = randomString(5);

    const onData = (d: IoDataEvent) => {
      try {
        //eslint-disable-next-line functional/no-let
        let cleaned = d.data;

        // Prefixed with angled bracket sometimes?
        if (cleaned.startsWith(`>{`) && cleaned.endsWith(`}`)) {
          cleaned = cleaned.substring(1);
        }

        // Parse reply, expecting JSON.
        const dd = JSON.parse(cleaned);

        // Check for reply field, and that it matches
        if (`reply` in dd) {
          if (dd.reply === id) {
            done(); // Stop waiting for result
            if (`result` in dd) {
              resolve(dd.result);
            }
          } else {
            warn(`Expected reply ${id}, got ${dd.reply}`);
          }
        } else {
          warn(`Expected packet, missing 'reply' field. Got: ${d.data}`);
        }
      } catch (ex: unknown) {
        // If there was a syntax error, response won't be JSON
        if (assumeExclusive) {
          // Fail with unexpected reply as the message
          done(d.data);
        } else {
          // Unexpected reply, but we cannot be sure if it's in response to eval or
          // some other code running on board. So just warn and eventually timeout
          warn(ex as string);
        }
      }
    };

    const onStateChange = (evt: StateChangeEvent<GenericStateTransitions>) => {
      if (evt.newState !== `connected`) {
        done(`State changed to '${evt.newState}', aborting`);
      }
    };

    device.addEventListener(`data`, onData);
    device.addEventListener(`change`, onStateChange);

    // Init waitFor
    const done = waitFor(
      timeoutMs,
      (reason: string) => {
        reject(reason);
      },
      () => {
        // If we got a response or there was a timeout, remove event listeners
        device.removeEventListener(`data`, onData);
        device.removeEventListener(`change`, onStateChange);
      }
    );

    const src = `\x10${evalReplyPrefix}(JSON.stringify({reply:"${id}", result:JSON.stringify(${code})}))\n`;
    if (debug) warn(src);
    device.write(src);
  });
};
