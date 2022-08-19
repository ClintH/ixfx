import {EspruinoBleDevice} from "./EspruinoBleDevice";
import {defaultOpts as NordicDefaults } from "./NordicBleDevice.js";
import {StateChangeEvent} from "../flow/StateMachine.js";
import {ISimpleEventEmitter} from "../Events.js";
import {string as randomString} from "../Random.js";
import {waitFor} from "../flow/WaitFor.js";
import {EspruinoSerialDevice, EspruinoSerialDeviceOpts} from "./EspruinoSerialDevice.js";

export {EspruinoBleDevice, EspruinoSerialDevice, EspruinoSerialDeviceOpts};

export type DataEvent = {
  readonly data:string
}

export type Events = {
  readonly data: DataEvent
  readonly change: StateChangeEvent
};

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
}

/**
 * Options for code evaluation
 */
export type EvalOpts = {
  /**
   * Milliseconds to wait before giving up on well-formed reply. 5 seconds is the default.
   */
  readonly timeoutMs?: number
  /**
   * If true (default), it assumes that anything received from the board
   * is a response to the eval
   */
  readonly assumeExclusive?: boolean
};


export type EspruinoBleOpts = {
  /**
   * If the name is specified, this value is used
   * for filtering Bluetooth devices
   */
  readonly name?:string,
  /**
   * If true, additional logging messages are
   * displayed on the console
   */
  readonly debug?:boolean
  /**
   * If specified, these filtering options are used instead
   */
  readonly filters?: readonly BluetoothLEScanFilter[]
}

/**
 * Instantiates a Puck.js. See {@link EspruinoBleDevice} for more info.
 * [Online demos](https://clinth.github.io/ixfx-demos/io/)
 * 
 * If `opts.name` is specified, this will the the Bluetooth device sought.
 * 
 * ```js
 * const e = await puck({ name:`Puck.js a123` });
 * ```
 * 
 * If no name is specified, a list of all devices starting with `Puck.js` are shown.
 * 
 * To get more control over filtering, pass in `opts.filter`. `opts.name` is not used as a filter in this scenario.
 * 
 * ```js
 * const filters = [
 *  { namePrefix: `Puck.js` },
 *  { namePrefix: `Pixl.js` },
 *  {services: [NordicDefaults.service] }
 * ]
 * const e = await puck({ filters });
 * ```
 * 
 * @returns Returns a connected instance, or throws exception if user cancelled or could not connect.
 */
export const puck = async (opts:EspruinoBleOpts = {}) => {
  const name = opts.name ?? `Puck`;
  const debug = opts.debug ?? false;

  const device = await navigator.bluetooth.requestDevice({
    filters:getFilters(opts), 
    optionalServices: [NordicDefaults.service]
  });

  console.log(device.name);
  const d = new EspruinoBleDevice(device, {name, debug});
  await d.connect();
  return d;
};

/**
 * Create a serial-connected Espruino device. See {@link EspruinoSerialDevice} for more info.
 * @param opts 
 * @returns Returns a connected instance, or throws exception if user cancelled or could not connect.
 */
export const serial = async (opts:{readonly name?:string, readonly debug?:boolean, readonly evalTimeoutMs?:number} = {}) => {
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
const getFilters = (opts:EspruinoBleOpts) => {
  //eslint-disable-next-line functional/no-let
  const filters:BluetoothLEScanFilter[] = [];

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
    filters.push({namePrefix: `Puck.js`});
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
 * const filters = [
 *  { namePrefix: `Puck.js` },
 *  { namePrefix: `Pixl.js` },
 *  {services: [NordicDefaults.service] }
 * ]
 * const e = await connectBle({ filters });
 * ```
 * 
 * @returns Returns a connected instance, or throws exception if user cancelled or could not connect.
 */
export const connectBle = async (opts:EspruinoBleOpts = {}) => {
  const device = await navigator.bluetooth.requestDevice({
    filters: getFilters(opts),
    optionalServices: [NordicDefaults.service]
  });
  const d = new EspruinoBleDevice(device, {name:`Espruino`});
  await d.connect();
  return d;
};

export interface EspruinoDevice extends ISimpleEventEmitter<Events> {
  write(m:string):void
  writeScript(code:string):void
  disconnect():void
  get evalTimeoutMs():number
}

export const deviceEval = async (code:string, opts:EvalOpts = {}, device:EspruinoDevice, evalReplyPrefix:string, debug:boolean, warn:(m:string) => void):Promise<string> => {
  const timeoutMs = opts.timeoutMs ?? device.evalTimeoutMs;
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
            warn(`Expected reply ${id}, got ${dd.reply}`);
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
          warn(ex as string);
        }
      }
    };

    const onStateChange = (e:StateChangeEvent) => {
      if (e.newState !== `connected`) done(`State changed to '${e.newState}', aborting`);
    };

    device.addEventListener(`data`, onData);
    device.addEventListener(`change`, onStateChange);

    // Init waitFor
    const done = waitFor(timeoutMs, (reason:string) => {
      reject(reason);
    }, () => {
      // If we got a response or there was a timeout, remove event listeners
      device.removeEventListener(`data`, onData);
      device.removeEventListener(`change`, onStateChange);
    });

    const src = `\x10${evalReplyPrefix}(JSON.stringify({reply:"${id}", result:JSON.stringify(${code})}))\n`;
    if (debug) warn(src);
    device.write(src);
  });
};