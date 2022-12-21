import { getOrGenerateSync } from "./collections/Map.js";
import { goldenAngleColour } from "./visual/Colour.js";

//eslint-disable-next-line functional/no-let
let logColourCount = 0;
const logColours = getOrGenerateSync(new Map<string, string>(), () => goldenAngleColour(++logColourCount));


/**
 * Returns a bundled collection of {@link logger}s
 * 
 * ```
 * const con = logSet(`a`);
 * con.log(`Hello`);  // console.log(`a Hello`);
 * con.warn(`Uh-oh`); // console.warn(`a Uh-oh`);
 * con.error(`Eek!`); // console.error(`a Eek!`);
 * ```
 * @param prefix 
 * @returns 
 */
export const logSet = (prefix:string, verbose = true) => {
  if (verbose) {
    return {
      log: logger(prefix, `log`),
      warn: logger(prefix, `warn`),
      error: logger(prefix, `error`)
    };
  } else {
    return {
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      log: (_:any) => { /** no-op */ },
      warn: logger(prefix, `warn`),
      error: logger(prefix, `error`)
    };
  }

};

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Logger = (m:any)=>void;
export type LogSet = {
  readonly log:Logger,
  readonly warn:Logger,
  readonly error:Logger
};

/**
 * Returns a console logging function which prefixes messages. This is
 * useful for tracing messages from different components. Each prefix
 * is assigned a colour, further helping to distinguish messages.
 * 
 * Use {@link logSet} to get a bundled set.
 * 
 * ```
 * // Initialise once
 * const log = logger(`a`);
 * const error = logger(`a`, `error`);
 * const warn = logger(`a`, `warn);
 * 
 * // And then use
 * log(`Hello`);    // console.log(`a Hello`);
 * error(`Uh-oh`);  // console.error(`a Uh-oh`);
 * warn(`Eek!`);    // console.warn(`a Eeek!`);
 * ```
 * @param prefix 
 * @param kind 
 * @returns 
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logger = (prefix:string, kind:`log` | `warn` | `error` = `log`):Logger => (m:any) => {
  if (m === undefined) {
    m = `(undefined)`;
  } else if (typeof m === `object`) {
    m = JSON.stringify(m);
  }

  switch (kind) {
  case `log`:
    console.log(`%c${prefix} ${m}`, `color: ${logColours(prefix)}`);
    break;
  case `warn`:
    console.warn(prefix, m);
    break;
  case `error`:
    console.error(prefix, m);
    break;
  }
};