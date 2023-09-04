import { resolveEl } from './Util.js';
import { addShadowCss } from './ShadowDom.js';

export type LogOpts = {
  readonly reverse?: boolean;
  readonly capacity?: number;
  readonly timestamp?: boolean;
  readonly collapseDuplicates?: boolean;
  readonly monospaced?: boolean;
  readonly minIntervalMs?: number;
  readonly css?: string;
};

//eslint-disable-next-line functional/no-mixed-types
export type Log = {
  clear(): void;
  error(messageOrError: unknown): void;
  log(message?: string | object | number): HTMLElement | undefined;
  warn(message?: string | object | number): HTMLElement | undefined;
  //eslint-disable-next-line functional/prefer-immutable-types
  append(el: HTMLElement): void;
  dispose(): void;
  readonly isEmpty: boolean;
};

/**
 * Allows writing to a DOM element in console.log style. Element grows in size, so use
 * something like `overflow-y: scroll` on its parent
 *
 * ```
 * const l = log(`#dataStream`); // Assumes HTML element with id `dataStream` exists
 * l.log(`Hi`);
 * l.log(); // Displays a horizontal rule
 *
 * const l = log(document.getElementById(`dataStream`), {
 *  timestamp: true,
 *  truncateEntries: 20
 * });
 * l.log(`Hi`);
 * l.error(`Some error`); // Adds class `error` to line
 * ```
 *
 * For logging high-throughput streams:
 * ```
 * // Silently drop log if it was less than 5ms since the last
 * const l = log(`#dataStream`, { minIntervalMs: 5 });
 *
 * // Only the last 100 entries are kept
 * const l = log(`#dataStream`, { capacity: 100 });
 * ```
 *
 * @param {(HTMLElement | string | undefined)} elOrId Element or id of element
 * @param {LogOpts} opts
 * @returns {Log}
 */
export const log = (
  //eslint-disable-next-line functional/prefer-immutable-types
  domQueryOrElement: HTMLElement | string,
  opts: LogOpts = {}
): Log => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const {
    capacity = 0,
    monospaced = true,
    timestamp = false,
    collapseDuplicates = true,
    css = ``,
  } = opts;

  // eslint-disable-next-line functional/no-let
  let added = 0;
  // eslint-disable-next-line functional/no-let
  let lastLog: string | undefined;
  // eslint-disable-next-line functional/no-let
  let lastLogRepeats = 0;

  const parentElement = resolveEl<HTMLElement>(domQueryOrElement);
  const fontFamily = monospaced
    ? `Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", Monaco, "Courier New", Courier, monospace`
    : `normal`;
  const shadowRoot = addShadowCss(
    parentElement,
    `
  .log {
    font-family: ${ fontFamily };
    background-color: var(--code-background-color);
    padding: var(--padding1, 0.2em);
    overflow-y: auto;
    height:100%;
  }
  .timestamp {
    margin-right: 0.5em;
    opacity: 0.5;
    font-size: 70%;
    align-self: center;
  }
  .line {
    display: flex;
    padding-bottom: 0.1em;
    padding-top: 0.1em;
  }
  .line:hover {
  
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
    word-break: break-word;
  }
  ${ css }
  `
  );

  const el = document.createElement(`div`);
  // eslint-disable-next-line functional/immutable-data,unicorn/no-keyword-prefix
  el.className = `log`;
  shadowRoot.append(el);

  const error = (messageOrError: string | Error | unknown) => {
    const line = document.createElement(`div`);

    if (typeof messageOrError === `string`) {
      // eslint-disable-next-line functional/immutable-data
      line.innerHTML = messageOrError;
    } else if (messageOrError instanceof Error) {
      const stack = messageOrError.stack;
      line.innerHTML = stack === undefined ? messageOrError.toString() : stack.toString();
    } else {
      // eslint-disable-next-line functional/immutable-data
      line.innerHTML = messageOrError as string;
    }
    line.classList.add(`error`);
    append(line);
    lastLog = undefined;
    lastLogRepeats = 0;
  };

  //eslint-disable-next-line functional/no-let
  let lastLogTime = 0;

  const warn = (whatToLog: unknown = ``): HTMLElement | undefined => {
    const element = log(whatToLog);
    if (!element) return element;
    element.classList.add(`warning`);
    return element;
  }
  const log = (whatToLog: unknown = ``): HTMLElement | undefined => {
    // eslint-disable-next-line functional/no-let
    let message: string | undefined;
    const interval = window.performance.now() - lastLogTime;
    if (opts.minIntervalMs && interval < opts.minIntervalMs) return;
    lastLogTime = window.performance.now();

    if (typeof whatToLog === `object`) {
      message = JSON.stringify(whatToLog);
    } else if (whatToLog === undefined) {
      message = `(undefined)`;
    } else if (whatToLog === null) {
      message = `(null)`;
    } else if (typeof whatToLog === `number`) {
      if (Number.isNaN(message)) message = `(NaN)`;
      message = whatToLog.toString();
    } else {
      message = whatToLog as string;
    }

    if (message.length === 0) {
      const rule = document.createElement(`hr`);
      lastLog = undefined;
      append(rule);
    } else if (message === lastLog && collapseDuplicates) {
      const lastElement = el.firstElementChild as HTMLElement;
      // eslint-disable-next-line functional/no-let
      let lastBadge = lastElement.querySelector(`.badge`);
      if (lastBadge === null) {
        lastBadge = document.createElement(`div`);
        // eslint-disable-next-line functional/immutable-data,unicorn/no-keyword-prefix
        lastBadge.className = `badge`;
        lastElement.insertAdjacentElement(`beforeend`, lastBadge);
      }
      if (lastElement !== null) {
        // eslint-disable-next-line functional/immutable-data
        lastBadge.textContent = (++lastLogRepeats).toString();
      }
      return lastElement;
    } else {
      const line = document.createElement(`div`);
      // eslint-disable-next-line functional/immutable-data
      line.textContent = message;
      append(line);
      lastLog = message;
      return line;
    }
  };


  //eslint-disable-next-line functional/prefer-immutable-types
  const append = (line: HTMLElement) => {
    if (timestamp) {
      const wrapper = document.createElement(`div`);
      const timestamp = document.createElement(`div`);
      // eslint-disable-next-line functional/immutable-data,unicorn/no-keyword-prefix
      timestamp.className = `timestamp`;
      // eslint-disable-next-line functional/immutable-data
      timestamp.textContent = new Date().toLocaleTimeString();
      wrapper.append(timestamp, line);
      line.classList.add(`msg`);
      wrapper.classList.add(`line`);
      line = wrapper;
    } else {
      line.classList.add(`line`, `msg`);
    }

    if (opts.reverse) {
      el.append(line);
    } else {
      el.insertBefore(line, el.firstChild);
    }

    if (capacity > 0 && ++added > capacity * 2) {
      while (added > capacity) {
        el.lastChild?.remove();
        added--;
      }
    }

    if (opts.reverse) {
      // Scroll to bottom
      //eslint-disable-next-line functional/immutable-data
      el.scrollTop = el.scrollHeight;
    }
    lastLogRepeats = 0;
  };

  const clear = () => {
    // eslint-disable-next-line functional/immutable-data
    el.innerHTML = ``;
    lastLog = undefined;
    lastLogRepeats = 0;
    added = 0;
  };

  const dispose = () => {
    el.remove();
  };

  return {
    error,
    log,
    warn,
    append,
    clear,
    dispose,
    get isEmpty() {
      return added === 0;
    },
  };
};
