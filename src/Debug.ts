import { getOrGenerateSync } from "./collections/Map.js";
import { goldenAngleColour } from "./visual/Colour.js";

//eslint-disable-next-line functional/no-let
let logColourCount = 0;
const logColours = getOrGenerateSync(new Map<string, string>(), () => goldenAngleColour(++logColourCount));


/**
 * Returns a bundled collection of {@link logger}s
 * 
 * ```js
 * const con = logSet(`a`);
 * con.log(`Hello`);  // console.log(`a Hello`);
 * con.warn(`Uh-oh`); // console.warn(`a Uh-oh`);
 * con.error(`Eek!`); // console.error(`a Eek!`);
 * ```
 * 
 * By default each prefix is assigned a colour. To use
 * another logic, provide the `colourKey` parameter.
 * 
 * ```js
 * // Both set of loggers will use same colour
 * const con = logSet(`a`, true, `system`);
 * const con2 = logSet(`b`, true, `system`);
 * ```
 * @param prefix Prefix for log messages
 * @param verbose True by default. If false, log() messages are a no-op
 * @param colourKey If specified, log messages will be coloured by this key instead of prefix (default)
 * @returns 
 */
export const logSet = (prefix:string, verbose = true, colourKey?:string) => {
  if (verbose) {
    return {
      log: logger(prefix, `log`, colourKey),
      warn: logger(prefix, `warn`, colourKey),
      error: logger(prefix, `error`, colourKey)
    };
  } else {
    return {
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      log: (_:any) => { /** no-op */ },
      warn: logger(prefix, `warn`, colourKey),
      error: logger(prefix, `error`, colourKey)
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
 * 
 * Provide the `colourKey` parameter to make log messages
 * be coloured the same, even though the prefix is different.
 * ```js
 * // Both loggers will use the same colour because they
 * // share the colour key `system`
 * const log = logger(`a`,`log`,`system`);
 * const log2 = logger(`b`, `log`, `system`);
 * ```
 * @param prefix 
 * @param kind 
 * @param colourKey Optional key to colour log lines by instead of prefix
 * @returns 
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logger = (prefix:string, kind:`log` | `warn` | `error` = `log`, colourKey?:string):Logger => (m:any) => {
  if (m === undefined) {
    m = `(undefined)`;
  } else if (typeof m === `object`) {
    m = JSON.stringify(m);
  }

  const colour = colourKey ?? prefix;
  switch (kind) {
  case `log`:
    console.log(`%c${prefix} ${m}`, `color: ${logColours(colour)}`);
    break;
  case `warn`:
    console.warn(prefix, m);
    break;
  case `error`:
    console.error(prefix, m);
    break;
  }
};