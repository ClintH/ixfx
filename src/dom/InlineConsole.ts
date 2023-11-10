import { getErrorMessage } from '../debug/GetErrorMessage.js';
import { afterMatch } from '../Text.js';
import { log, type LogOpts } from './Log.js';

export type InlineConsoleOptions = LogOpts;

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
 * @param opts 
 */
export const inlineConsole = (opts: InlineConsoleOptions = {}) => {
  const original = {
    log: console.log,
    error: console.error,
    warn: console.warn
  };

  const logElement = document.createElement(`DIV`);
  logElement.id = `ixfx-log`;
  logElement.style.position = `fixed`;
  logElement.style.left = `0px`;
  logElement.style.top = `0px`;
  logElement.style.pointerEvents = `none`;
  logElement.style.display = `none`;

  document.body.prepend(logElement);

  const logger = log(logElement, opts);

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

  //eslint-disable-next-line unicorn/prefer-add-event-listener
  window.onerror = (event, source, lineno, _colno, error) => {
    const abbreviatedSource = source === undefined ? `` : afterMatch(source, `/`, { fromEnd: true });
    //const eventString = typeof event === `string` ? event : JSON.stringify(event).toString();
    const eventString = getErrorMessage(error);
    //const errorString = error === undefined ? `` : error.message;

    logger.error(eventString + ` (${ abbreviatedSource }:${ lineno })`);
    visibility(true);
  }
}