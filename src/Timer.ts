
export type Timer = {
  reset(): void
  elapsed(): number
}

export type TimerSource = () => Timer;
/**
 * A timer that uses clock time
 *
 * @returns {Timer}
 */
export const msRelativeTimer = (): Timer => {
  // eslint-disable-next-line functional/no-let
  let start = window.performance.now();
  return {
    reset: () => {
      start = window.performance.now();
    },
    elapsed: () => (window.performance.now() - start)
  };
};

/**
 * A timer that progresses with each call
 *
 * @returns {Timer}
 */
export const tickRelativeTimer = (): Timer => {
  // eslint-disable-next-line functional/no-let
  let start = 0;
  return {
    reset: () => {
      start = 0;
    },
    elapsed: () => start++
  };
};