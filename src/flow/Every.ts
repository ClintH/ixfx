import {  integer as guardInteger } from "../Guards.js";

/**
 * Returns true for every _n_th call, eg 2 for every second call.
 * 
 * If `nth` is 1, returns true for everything. 0 will be false for everything.
 * 
 * Usage:
 * ```js
 * const tenth = everyNth(10);
 * window.addEventListener(`pointermove`, evt => {
 *  if (!tenth(evt)) return; // Filter out
 *  // Continue processing, it is the 10th thing.
 * 
 * });
 * ```
 * 
 * Alternative:
 * ```js
 * window.addEventListener(`pointermove`, everyNth(10, evt => {
 *  // Do something with tenth item...
 * });
 * ```
 * @param nth Every nth item
 * @param callback 
 * @returns Function which in turn returns true if nth call has been hit, false otherwise
 */
export const everyNth = (nth:number, callback?:(...args:readonly unknown[])=>void) => {
  guardInteger(nth, `positive`, `nth`);
  
  //eslint-disable-next-line functional/no-let
  let counter = 0;
  return (...args:unknown[]):boolean => {
    if (++counter === nth) {
      counter = 0;
      if (callback) callback(...args);
      return true;
    }
    return false;
  };
};