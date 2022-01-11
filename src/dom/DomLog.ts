import {addShadowCss} from "./ShadowDom";

export type DomLogOpts = {
  truncateEntries?: number,
  timestamp?: boolean,
  collapseDuplicates?:boolean,
  monospaced?:boolean
}

export type DomLog = {
  clear():void
  error(msgOrError:string|Error):void
  log(msg?:string):void
  append(el:HTMLElement):void
  dispose():void
}

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
export const domLog = (elOrId: HTMLElement | string | undefined, opts: DomLogOpts = {}):DomLog => {
  const {truncateEntries = 0, monospaced = true, timestamp = false, collapseDuplicates = true } = opts;

  const empty = {
    log: (_: string) => { /* no-op */ },
    clear: () => { /* no-op */ },
    dispose: () => { /* no-op */ },
    error: (_:string|Error) => { /* no-op */ },
    append: (_:HTMLElement) => { /* no-op */ }
  };

  let parentEl:HTMLElement;
  let added = 0;
  let lastLog:string|undefined;
  let lastLogRepeats = 0;

  if (typeof elOrId === `string`) {
    const sought = document.getElementById(elOrId);
    if (sought === null) return empty;
    parentEl = sought;
  } else if (elOrId !== undefined) {
    parentEl = elOrId;
  } else return empty;
  
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
    background-color: var(--primary-focus, whitesmoke);
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
  el.className = `log`;
  shadowRoot.append(el);

  const error = (msgOrError: string | Error) => {
    const line = document.createElement(`div`);
    if (typeof msgOrError === `string`) {
      line.innerHTML = msgOrError;
    } else {
      const stack = msgOrError.stack;
      if (stack === undefined) {
        line.innerHTML = msgOrError.toString();
      } else {
        line.innerHTML = stack.toString();
      }
    }
    line.classList.add(`error`);
    append(line);
    lastLog = undefined;
    lastLogRepeats = 0;
  };

  const log = (whatToLog: unknown = ``) => {
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
      let lastBadge = lastEl.querySelector(`.badge`);
      if (lastBadge === null) {
        lastBadge = document.createElement(`div`);
        lastBadge.className = `badge`;
        lastEl.insertAdjacentElement(`beforeend`, lastBadge);
      }
      if (lastEl !== null) {
        lastBadge.textContent = (++lastLogRepeats).toString();
      }
    } else {
      const line = document.createElement(`div`);
      line.innerHTML = msg;
      append(line);
      lastLog = msg;
    }
  };

  const append = (line: HTMLElement) => {
    if (timestamp) {
      const wrapper = document.createElement(`div`);
      const timestamp = document.createElement(`div`);
      timestamp.className = `timestamp`;

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
      while (added > truncateEntries) {
        el.lastChild?.remove();
        added--;
      }
    }
    lastLogRepeats = 0;
  };

  const clear = () => {
    el.innerHTML = ``;
    lastLog = undefined;
    lastLogRepeats = 0;
  };

  const dispose = () => {
    el.remove();
  };

  return {error, log, append, clear, dispose};
};