/**
 * Helper function for calling code that should fail after a timeout.
 * In short, it allows you to signal when the function succeeded, to cancel it, or
 * to be notified if it was canceled or completes.
 *
 * @example Verbose example
 * ```js
 * // This function is called by `waitFor` if it was cancelled
 * const onAborted = (reason:string) => {
 *  // 'reason' is a string describing why it has aborted.
 *  // ie: due to timeout or because done() was called with an error
 * };
 *
 * // This function is called by `waitFor` if it completed
 * const onComplete = (success:boolean) => {
 *  // Called if we were aborted or finished succesfully.
 *  // onComplete will be called after onAborted, if it was an error case
 * }
 *
 * // If done() is not called after 1000, onAborted will be called
 * // if done() is called or there was a timeout, onComplete is called
 * const done = waitFor(1000, onAborted, onComplete);
 *
 * // Signal completed successfully (thus calling onComplete(true))
 * done();
 *
 * // Signal there was an error (thus calling onAborted and onComplete(false))
 * done(`Some error`);
 * ```
 *
 * The completion handler is useful for removing event handlers.
 *
 * @example Compact example
 * ```js
 * const done = waitFor(1000,
 *  (reason) => {
 *    console.log(`Aborted: ${reason}`);
 *  },
 *  (success) => {
 *    console.log(`Completed. Success: ${success ?? `Yes!` : `No`}`)
 *  });
 *
 * try {
 *  runSomethingThatMightScrewUp();
 *  done(); // Signal it succeeded
 * } catch (e) {
 *  done(e); // Signal there was an error
 * }
 * ```
 * @param timeoutMs
 * @param onAborted
 * @param onComplete
 * @returns
 */
export const waitFor = (
  timeoutMs: number,
  onAborted: (reason: string) => void,
  onComplete?: (success: boolean) => void
) => {

  let t: ReturnType<typeof globalThis.setTimeout> | undefined;

  let success = false;
  const done = (error?: string) => {
    if (t !== undefined) {
      window.clearTimeout(t);
      t = undefined;
    }
    if (error) {
      onAborted(error);
    } else {
      success = true;
    }
    if (onComplete !== undefined) onComplete(success);
  };

  t = globalThis.setTimeout(() => {
    t = undefined;
    try {
      onAborted(`Timeout after ${ timeoutMs }ms`);
    } finally {
      if (onComplete !== undefined) onComplete(success);
    }
  }, timeoutMs);

  return done;
};
