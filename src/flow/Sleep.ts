import {integer as guardInteger} from '../Guards.js';
/**
 * Returns after `timeoutMs`. 
 * 
 * @example In an async function
 * ```js
 * console.log(`Hello`);
 * await sleep(1000);
 * console.log(`There`); // Prints one second after
 * ```
 * 
 * @example As a promise
 * ```js
 * console.log(`Hello`);
 * sleep(1000)
 *  .then(() => console.log(`There`)); // Prints one second after
 * ```
 * 
 * If a timeout of 0 is given, `requestAnimationFrame` is used instead of `setTimeout`.
 * 
 * {@link delay} and {@link sleep} are similar. `delay()` takes a parameter of what code to execute after the timeout, while `sleep()` just resolves after the timeout.
 * 
 * @param timeoutMs
 * @return
 */
export const sleep = <V>(timeoutMs: number, value?:V): Promise<V|undefined> => {
  guardInteger(timeoutMs, `positive`, `timeoutMs`);
  if (timeoutMs === 0) {
    return new Promise<V|undefined>(resolve => requestAnimationFrame(_ => {
      resolve(value);
    }));
  } else {
    return new Promise<V|undefined>(resolve => setTimeout(() => resolve(value), timeoutMs));
  }
};