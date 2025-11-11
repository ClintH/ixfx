import type { MovingWindowOptions } from "./types.js";


/**
 * Creates a moving window
 * 
 * ```js
 * // Create a moving window of 3 samples
 * const window = movingWindow(3);
 * 
 * window(1); // [ 1 ]
 * window(2); // [ 1, 2 ]
 * window(3); // [ 1, 2, 3 ]
 * window(4); // [ 2, 3, 4 ]
 * ```
 * 
 * 'reject' option allows values to be discarded:
 * ```js
 * // Reject all NaN values
 * const window = movingWindow({ samples: 3, reject: (v) => Number.isNaN(v) });
 * ```
 * 
 * 'allow' is similar, but is applied after 'reject' (if provided). Instead, values
 * must pass _true_
 * 
 * If a reject/disallow is triggered, the current state of the queue is returned.
 * 
 * @param samplesOrOptions
 * @returns 
 */
export const movingWindow = <T>(
  samplesOrOptions: number | MovingWindowOptions<T>
) => movingWindowWithContext(samplesOrOptions).seen;

/**
 * As {@link movingWindow} but also allows access to context, namely you 
 * can access the window at any time without adding to it.
 * 
 * ```js
 * const window = movingWindowWithContext(3);
 * window.seen(1); // [ 1 ]
 * window.data;    // [ 1 ]
 * ```
 * @param samplesOrOptions 
 * @returns 
 */
export const movingWindowWithContext = <T>(
  samplesOrOptions: number | MovingWindowOptions<T>
) => {
  const q: T[] = [];
  const reject = typeof samplesOrOptions === `object` ? samplesOrOptions.reject : undefined;
  const allow = typeof samplesOrOptions === `object` ? samplesOrOptions.allow : undefined;
  const samples = typeof samplesOrOptions === `number` ? samplesOrOptions : samplesOrOptions.samples;
  const seen = (value: T) => {
    if (reject) {
      if (reject(value)) return q;
    }
    if (allow) {
      if (!allow(value)) return q;
    }
    q.push(value);
    while (q.length > samples) {
      q.shift();
    }
    return q;
  }
  return {
    seen,
    get data() { return [ ...q ] }
  }
};
