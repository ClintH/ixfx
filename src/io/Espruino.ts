import {StateChangeEvent} from "~/flow/StateMachine.js";
import {waitFor} from "../flow/Timer.js";
import {string as randomString} from "../Random.js";
import * as BleDevice from "./BleDevice.js";
import {defaultOpts as NordicDefaults, NordicBleDevice} from "./NordicBleDevice.js";

type Options = {
  readonly evalTimeoutMs?:number;
  readonly name?:string;
}

/**
 * An Espruino BLE-connection
 * 
 * Use the `puck` function to initialise and connect to a Puck.js.
 * It must be called in a UI event handler for browser security reasons.
 * 
 * ```js
 * const e = await puck();
 * ```
 * 
 * Listen for events:
 * ```js
 * // Received something
 * e.addEventLister(`data`, d => console.log(d.data));
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
 */
class Espruino extends NordicBleDevice {
  evalTimeoutMs:number;

  constructor(device:BluetoothDevice, opts:Options = {}) {
    super(device, opts);
    this.evalTimeoutMs = opts.evalTimeoutMs ?? 5*1000;
  }

  /**
   * Sends some code to be executed on the Espruino. The result
   * is packaged into JSON and sent back to your code.
   * 
   * ```js
   * const sum = await e.eval(`2+2`);
   * ```
   * 
   * It will wait for a period of time for a well-formed response from the
   * Espruino. This might not happen if there is a connection problem
   * or a syntax error in the code being `evaled()`. In cases like the latter,
   * it will take up to `timeoutMs` (default 5 seconds) before we give up
   * waiting for a correct response and throw an error.
   * 
   * Tweaking of the timeout may be required if `eval()` is giving up too quickly
   * or too slowly. A default timeout can be given when creating the class.
   *  
   * @param code Code to run on the Espruino
   * @param timeoutMs Timeout for execution. 5 seconds by default
   */
  async eval(code:string, timeoutMs?:number):Promise<string> {
    const timeout = timeoutMs ?? this.evalTimeoutMs;

    return new Promise((resolve, reject) => {
      // Generate a random id so reply can be matched up with this request
      const id = randomString(5);

      const onData = (d:BleDevice.DataEvent) => {
        try {
          // Parse reply, expecting JSON.
          const dd = JSON.parse(d.data);

          // Check for _reply field, and that it matches
          if (`reply` in dd) {
            if (dd.reply === id) {
              done(); // Stop waiting for result
              if (`result` in dd) {
                resolve(dd.result);
              } else if (`error` in dd) {
                done(dd.error);
              }
            } else {
              this.warn(`Expected reply ${id}, got ${dd._reply}`);
            }
          }
        } catch (ex:unknown) {
          // If we get back a syntax error, it won't be in our nice JSON format
          this.warn(ex);
        }
      };

      const onStateChange = (e:StateChangeEvent) => {
        if (e.newState !== `connected`) {
          // Signal error
          done(`State changed to '${e.newState}', aborting`);
        }
      };

      this.addEventListener(`data`, onData);
      this.addEventListener(`change`, onStateChange);

      const done = waitFor(timeout, (reason:string) => {
        reject(reason);
      }, () => {
        // If we got a response or there was a timeout, remove event listeners
        this.removeEventListener(`data`, onData);
        this.removeEventListener(`change`, onStateChange);
      });

      // const run = function(id) {
      //   try { return {reply: id, result: ${code}};
      //   } catch (ex) { return {reply:id, error: ex} }
      // }
      // Bluetooth.println(JSON.stringify(run("${id}")))\n`);
      this.write(`\x10Bluetooth.println(JSON.stringify({reply:"${id}", result:${code}}))\n`);
    });
  }
}

export const puck = async () => {
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
  const d = new Espruino(device, {name:`Puck`});
  await d.connect();
  return d;
};