export type Drifter = {
  update(v: number): number;
  reset(): void;
};

/**
 * WIP
 * Returns a {@link Drifter} that moves a value over time.
 *
 * It keeps track of how much time has elapsed, accumulating `driftAmtPerMs`.
 * The accumulated drift is wrapped on a 0..1 scale.
 * ```js
 * // Set up the drifer
 * const d = drif(0.001);
 *
 * d.update(1.0);
 * // Returns 1.0 + accumulated drift
 * ```
 * @param driftAmtPerMs
 * @returns
 */
export const drift = (driftAmtPerMs: number): Drifter => {
  //eslint-disable-next-line functional/no-let
  let lastChange = performance.now();

  const update = (v: number = 1) => {
    const elapsed = performance.now() - lastChange;

    const amt = (driftAmtPerMs * elapsed) % 1;
    lastChange = performance.now();
    const calc = (v + amt) % 1;
    return calc;
  };

  const reset = () => {
    lastChange = performance.now();
  };
  return { update, reset };
};
