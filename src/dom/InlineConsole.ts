import { getErrorMessage } from '../debug/GetErrorMessage.js';
import { afterMatch } from '../Text.js';
import { log, type LogOpts } from './Log.js';
import { resolveEl } from './ResolveEl.js';

export type InlineConsoleOptions = LogOpts & Partial<{
  /**
   * If true, styling is not applied
   */
  witholdCss: boolean,
  /**
   * If provided, entries are added to this element.
   * By default a new element, #ixfx-log is created and added
   * to the document.
   */
  insertIntoEl: string | HTMLElement
}>;

/**
 * Adds an inline console to the page. A DIV is added to display log messages.
 * 
 * Captures all console.log, console.warn and console.error calls, as well as unhandled exceptions.
 * 
 * ```js
 * // Adds the DIV and intercepts console logs
 * inlineConsole();
 * 
 * console.log(`Hello`); // message is displayed in the inline console
 * ```
 * @param options 
 */
export const inlineConsole = (options: InlineConsoleOptions = {}) => {
  const original = {
    log: console.log,
    error: console.error,
    warn: console.warn
  };
  const witholdCss = options.witholdCss ?? false;
  const insertIntoEl = options.insertIntoEl;

  let logElement: HTMLElement | undefined;
  if (insertIntoEl) {
    logElement = resolveEl(insertIntoEl);
  } else {
    logElement = document.createElement(`DIV`);
    logElement.id = `ixfx-log`;
    document.body.prepend(logElement);
  }
  if (!witholdCss) {
    logElement.style.position = `fixed`;
    logElement.style.left = `0px`;
    logElement.style.top = `0px`;
    logElement.style.pointerEvents = `none`;
    logElement.style.display = `none`;
  }

  const logger = log(logElement, options);

  const visibility = (show: boolean) => {
    logElement.style.display = show ? `block` : `none`;
  }

  console.error = (message?: any, ...optionalParameters: Array<any>) => {
    logger.error(message);
    if (optionalParameters.length > 0) {
      logger.error(optionalParameters);
    }
    original.error(message, ...optionalParameters);
    visibility(true);
  }

  console.warn = (message?: any, ...optionalParameters: Array<any>) => {
    logger.warn(message);
    if (optionalParameters.length > 0) {
      logger.warn(optionalParameters);
    }
    visibility(true);
  }

  console.log = (message?: any, ...optionalParameters: Array<any>) => {
    logger.log(message);
    if (optionalParameters.length > 0) {
      logger.log(optionalParameters);
    }
    original.log(message, ...optionalParameters);
    visibility(true);
  }

  window.onerror = (event, source, lineno, _colno, error) => {
    const abbreviatedSource = source === undefined ? `` : afterMatch(source, `/`, { fromEnd: true });
    const eventString = getErrorMessage(error);
    logger.error(eventString + ` (${ abbreviatedSource }:${ lineno })`);
    visibility(true);
  };

  window.addEventListener('unhandledrejection', function (e) {
    logger.error(e.reason);
    visibility(true);
  })
}