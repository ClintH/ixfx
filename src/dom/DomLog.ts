import {resolveEl} from "./Forms";
import {addShadowCss} from "./ShadowDom";

export type DomLogOpts = {
  readonly truncateEntries?: number,
  readonly timestamp?: boolean,
  readonly collapseDuplicates?:boolean,
  readonly monospaced?:boolean
}

export type DomLog = Readonly<{
  clear():void
  error(msgOrError:string|Error):void
  log(msg?:string):void
  append(el:HTMLElement):void
  dispose():void
}>

/**
 * Allows writing to a DOM element in console.log style. Element grows in size, so use
 * something like `overflow-y: scroll` on its parent
 * 
 * ```
 * const l = domLog(`dataStream`); // Assumes HTML element with id `dataStream` exists 
 * l.log(`Hi`);
 * l.log(); // Displays a horizontal rule
 * 
 * const l = domLog(document.getElementById(`dataStream`), {
 *  timestamp: true,
 *  truncateEntries: 20
 * });
 * l.log(`Hi`);
 * l.error(`Some error`); // Adds class `error` to line
 * 
 * ```
 *
 * @param {(HTMLElement | string | undefined)} elOrId Element or id of element
 * @param {DomLogOpts} opts
 * @returns {DomLog}
 */
export const domLog = (elOrId: HTMLElement | string, opts: DomLogOpts = {}):DomLog => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const {truncateEntries = 0, monospaced = true, timestamp = false, collapseDuplicates = true } = opts;

  // const empty = {
  //   log: (_: string) => { /* no-op */ },
  //   clear: () => { /* no-op */ },
  //   dispose: () => { /* no-op */ },
  //   error: (_:string|Error) => { /* no-op */ },
  //   append: (_:HTMLElement) => { /* no-op */ }
  // };

  // eslint-disable-next-line functional/no-let
  let added = 0;
  // eslint-disable-next-line functional/no-let
  let lastLog:string|undefined;
  // eslint-disable-next-line functional/no-let
  let lastLogRepeats = 0;

  const parentEl = resolveEl<HTMLElement>(elOrId);

  // if (typeof elOrId === `string`) {
  //   const sought = document.getElementById(elOrId);
  //   if (sought === null) {
  //     console.warn(`domLog element id not found ${elOrId}`);
  //     return empty;
  //   }
  //   parentEl = sought;
  // } else if (elOrId !== undefined) {
  //   parentEl = elOrId;
  // } else {
  //   console.warn(`domLog element not found`);
  //   return empty;
  // }

  const fontFamily = monospaced ? `Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", Monaco, "Courier New", Courier, monospace` : `normal`;
  const shadowRoot = addShadowCss(parentEl, `
  .log {
    font-family: ${fontFamily};
    background-color: var(--code-background-color);
    padding: var(--padding1, 0.2em);
  }
  .timestamp {
    margin-right: 0.5em;
    opacity: 0.5;
    font-size: 70%;
    align-self: center;
  }
  .line {
    display: flex;
  }
  .line:hover {
    background-color: var(--theme-bg-hover, whitesmoke);
  }
  .error {
    color: red;
  }
  .badge {
    border: 1px solid currentColor;
    align-self: center;
    font-size: 70%;
    padding-left: 0.2em;
    padding-right: 0.2em;
    border-radius: 1em;
    margin-left: 0.5em;
    margin-right: 0.5em;
  }
  .msg {
    flex: 1;
  }
  `);
  
  const el = document.createElement(`div`);
  // eslint-disable-next-line functional/immutable-data
  el.className = `log`;
  shadowRoot.append(el);

  const error = (msgOrError: string | Error) => {
    const line = document.createElement(`div`);
    if (typeof msgOrError === `string`) {
      // eslint-disable-next-line functional/immutable-data
      line.innerHTML = msgOrError;
    } else {
      const stack = msgOrError.stack;
      if (stack === undefined) {
        // eslint-disable-next-line functional/immutable-data
        line.innerHTML = msgOrError.toString();
      } else {
        // eslint-disable-next-line functional/immutable-data
        line.innerHTML = stack.toString();
      }
    }
    line.classList.add(`error`);
    append(line);
    lastLog = undefined;
    lastLogRepeats = 0;
  };

  const log = (whatToLog: unknown = ``) => {
    // eslint-disable-next-line functional/no-let
    let msg:string|undefined;
    if (typeof whatToLog === `object`) {
      msg = JSON.stringify(whatToLog);
    } else if (whatToLog === undefined) {
      msg = `(undefined)`;
    } else if (whatToLog === null) {
      msg = `(null)`;
    } else if (typeof whatToLog === `number`) {
      if (Number.isNaN(msg)) msg = `(NaN)`;
      msg = whatToLog.toString();
    } else {
      msg = whatToLog as string;
    }
    if (msg.length === 0) {
      const rule = document.createElement(`hr`);
      lastLog = undefined;
      append(rule);
    } else if (msg === lastLog && collapseDuplicates) {
      const lastEl = el.firstElementChild as HTMLElement;
      // eslint-disable-next-line functional/no-let
      let lastBadge = lastEl.querySelector(`.badge`);
      if (lastBadge === null) {
        lastBadge = document.createElement(`div`);
        // eslint-disable-next-line functional/immutable-data
        lastBadge.className = `badge`;
        lastEl.insertAdjacentElement(`beforeend`, lastBadge);
      }
      if (lastEl !== null) {
        // eslint-disable-next-line functional/immutable-data
        lastBadge.textContent = (++lastLogRepeats).toString();
      }
    } else {
      const line = document.createElement(`div`);
      // eslint-disable-next-line functional/immutable-data
      line.innerHTML = msg;
      append(line);
      lastLog = msg;
    }
  };

  const append = (line: HTMLElement) => {
    if (timestamp) {
      const wrapper = document.createElement(`div`);
      const timestamp = document.createElement(`div`);
      // eslint-disable-next-line functional/immutable-data
      timestamp.className = `timestamp`;
      // eslint-disable-next-line functional/immutable-data
      timestamp.innerText = new Date().toLocaleTimeString();
      wrapper.append(timestamp, line);
      line.classList.add(`msg`);
      wrapper.classList.add(`line`);
      line = wrapper;
    } else {
      line.classList.add(`line`, `msg`);
    }
    el.insertBefore(line, el.firstChild);

    if (truncateEntries > 0 && (++added > truncateEntries * 2)) {
      // eslint-disable-next-line functional/no-loop-statement
      while (added > truncateEntries) {
        el.lastChild?.remove();
        added--;
      }
    }
    lastLogRepeats = 0;
  };

  const clear = () => {
    // eslint-disable-next-line functional/immutable-data
    el.innerHTML = ``;
    lastLog = undefined;
    lastLogRepeats = 0;
  };

  const dispose = () => {
    el.remove();
  };

  return {error, log, append, clear, dispose};
};