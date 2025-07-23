/**
 * Creates a new Promise, returning the promise
 * along with its resolve and reject functions.
 * 
 * ```js
 * const { promise, resolve, reject } = promiseWithResolvers();
 * 
 * setTimeout(() => {
 *  resolve();
 * }, 1000);
 * 
 * await promise;
 * ```
 * 
 * Promise would be passed somewhere that expects a promise,
 * and you're free to call `resolve` or `reject` when needed.
 * @returns 
 */
export function promiseWithResolvers<T>() {
  let resolve: undefined | ((value: T) => void);
  let reject: undefined | ((reason: any) => void);
  const promise = new Promise<T>(
    (_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return { promise, resolve: resolve!, reject: reject! };
}