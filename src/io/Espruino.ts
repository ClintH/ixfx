import {EspruinoBleDevice} from "./EspruinoBleDevice";
import {defaultOpts as NordicDefaults } from "./NordicBleDevice.js";
import {StateChangeEvent} from "../flow/StateMachine.js";
import {ISimpleEventEmitter} from "../Events.js";
import {string as randomString} from "../Random.js";
import {waitFor} from "../flow/Timer.js";
import {EspruinoSerialDevice} from "./EspruinoSerialDevice";

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


/**
 * @inheritdoc EspruinoBleDevice
 * @returns Returns a connected instance, or throws exception if user cancelled or could not connect.
 */
export const puck = async (opts:{readonly name?:string, readonly debug?:boolean} = {}) => {
  const name = opts.name ?? `Puck`;
  const debug = opts.debug ?? false;

  const device = await navigator.bluetooth.requestDevice({
    filters: [
      {namePrefix: `Puck.js`},
      // {namePrefix: 'Pixl.js'},
      // {namePrefix: 'MDBT42Q'},
      // {namePrefix: 'RuuviTag'},
      // {namePrefix: 'iTracker'},
      // {namePrefix: 'Thingy'},
      // {namePrefix: 'Espruino'},
      {services: [NordicDefaults.service]}
    ], optionalServices: [NordicDefaults.service]
  });
  const d = new EspruinoBleDevice(device, {name, debug});
  await d.connect();
  return d;
};

/**
 * @inheritdoc EspruinoSerialDevice
 * @param opts 
 * @returns Returns a connected instance, or throws exception if user cancelled or could not connect.
 */
export const serial = async (opts:{readonly name?:string, readonly debug?:boolean, readonly evalTimeoutMs?:number} = {}) => {
  const d = new EspruinoSerialDevice(opts);
  await d.connect();
  return d;
};


/**
 * @inheritdoc EspruinoDevice
 * @returns Returns a connected instance, or throws exception if user cancelled or could not connect.
 */
export const connectBle = async () => {
  const device = await navigator.bluetooth.requestDevice({
    filters: [
      {namePrefix: `Puck.js`},
      {namePrefix: `Pixl.js`},
      {namePrefix: `MDBT42Q`},
      {namePrefix: `RuuviTag`},
      {namePrefix: `iTracker`},
      {namePrefix: `Thingy`},
      {namePrefix: `Espruino`},
      {services: [NordicDefaults.service]}
    ], optionalServices: [NordicDefaults.service]
  });
  const d = new EspruinoBleDevice(device, {name:`Espruino`});
  await d.connect();
  return d;
};

export interface EspruinoDevice extends ISimpleEventEmitter<Events> {
  write(m:string):void
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