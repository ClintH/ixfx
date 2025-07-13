/**
 * Runs a function once
 *
 * ```js
 * const init = runOnce(() => {
 *  // do some initialisation
 * });
 *
 * init(); // Runs once
 * init(); // no-op
 * ```
 * @param onRun
 * @returns
 */
export const runOnce = (onRun: () => boolean): (() => boolean) => {
  let run = false;
  let success = false;
  return () => {
    if (run) return success;
    run = true;
    success = onRun();
    return success;
  };
};
