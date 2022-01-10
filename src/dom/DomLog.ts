import {addShadowCss} from "./ShadowDom.js";

export type DomLogOpts = {
  truncateEntries?: number,
  timestamp?: boolean,
  collapseDuplicates?:boolean
}

export type DomLog = {
  clear():void
  error(msgOrError:string|Error):void
  log(msg?:string):void
  append(el:HTMLElement):void
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
  const {truncateEntries = 0, timestamp = false, collapseDuplicates = true } = opts;

  const empty = {
    log: (_: string) => { /* no-op */ },
    clear: () => { /* no-op */ },
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
  
  const shadowRoot = addShadowCss(parentEl, `
  .timestamp {
    margin-right: 0.5em;
    opacity: 0.5;
    font-size: 70%;
    align-self: center;
  }
  .line {
    display: flex;
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
    line.innerHTML = msgOrError.toString();
    line.classList.add(`error`);
    append(line);
    lastLog = undefined;
    lastLogRepeats = 0;
  };

  const log = (msg: string = ``) => {
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
      line.className = `msg`;
      wrapper.className = `line`;
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

  return {error, log, append, clear};
};