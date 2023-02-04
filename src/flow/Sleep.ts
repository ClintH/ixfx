import { integer as guardInteger } from '../Guards.js';
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
 * A value can be provided, which is returned on awaking:
 * ```js
 * const v = await sleep(1000, `hello`);
 * // v = `hello`
 * ```
 * 
 * Provide an AbortSignal to cancel the sleep and throwing an exception
 * so code after the sleep doesn't happen.
 * 
 * ```js
 * const ac = new AbortController();
 * setTimeout(() => { ac.abort(); }, 1000); // Abort after 1s
 * 
 * // Sleep for 1min
 * await sleep(60*1000, undefined, ac.signal);
 * console.log(`Awake`); // This line doesn't get called because an exception is thrown when aborting
 * ```
 * @param timeoutMs
 * @param signal
 * @return
 */
export const sleep = <V>(timeoutMs:number, value?:V, signal?:AbortSignal):Promise<V|undefined> => {
  guardInteger(timeoutMs, `positive`, `timeoutMs`);
  if (timeoutMs === 0) {
    return new Promise<V|undefined>(resolve => requestAnimationFrame(_ => {
      resolve(value);
    }));
  } else {
    return new Promise<V|undefined>((resolve, reject) => {
      if (signal) {
        signal.addEventListener(`abort`, () => {
          reject(`Aborted`);
        });
      }
      setTimeout(() => {
        signal?.throwIfAborted();
        resolve(value);
      }, timeoutMs);

    });
  }
};
