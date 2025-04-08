import type { Modulate } from "./types.js";

/**
 * Creates an easing function using a simple cubic bezier defined by two points.
 *
 * Eg: https://cubic-bezier.com/#0,1.33,1,-1.25
 *  a:0, b: 1.33, c: 1, d: -1.25
 *
 * ```js
 * import { Easings } from "https://unpkg.com/ixfx/dist/modulation.js";
 * // Time-based easing using bezier
 * const e = Easings.time(fromCubicBezier(1.33, -1.25), 1000);
 * e.compute();
 * ```
 * @param b
 * @param d
 * @returns Value
 */
export const cubicBezierShape =
  (b: number, d: number): Modulate =>
    (t: number) => {
      const s = 1 - t;
      const s2 = s * s;
      const t2 = t * t;
      const t3 = t2 * t;
      return 3 * b * s2 * t + 3 * d * s * t2 + t3;
    };
