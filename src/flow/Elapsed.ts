import {intervalToMs} from "./Interval.js";

export type SinceFn = ()=>number;

/**
 * Returns elapsed time since initial call.
 * ```js
 * // Record start
 * const elapsed = Elapsed.since();
 * 
 * // Get elapsed time in millis
 * elapsed(); // Yields number
 * ```
 * @returns 
 */
export const since = ():SinceFn => {
  const start = Date.now();
  return ():number => {
    return Date.now() - start;
  }
}

/**
 * Returns a function that reports an 'infinite' elapsed time.
 * this can be useful as an initialiser for `elapsedSince`.
 * 
 * ```js
 * // Init clicked to be an infinite time
 * let clicked = Elapsed.infinity();
 * 
 * document.addEventListener('click', () => {
 *  // Now that click has happened, we can assign it properly
 *  clicked = Elapsed.since();
 * });
 * ```
 * @returns 
 */
export const infinity = ():SinceFn => {
  return ():number => {
    return Number.POSITIVE_INFINITY;
  }
}


export const toString = (millisOrFn:number|SinceFn):string => {
  const interval = (typeof millisOrFn === `number`) ? millisOrFn : millisOrFn();
  
  //eslint-disable-next-line functional/no-let
  let ms = intervalToMs(interval);
  if (!ms) return '(undefined)';
  if (ms < 1000) return `${ms}ms`;
  ms /= 1000;
  if (ms < 120) return `${ms.toFixed(2)}secs`;
  ms /= 60;
  if (ms < 60) return `${ms.toFixed(2)}mins`;
  ms /= 60;
  return `${ms.toFixed(2)}hrs`;
}