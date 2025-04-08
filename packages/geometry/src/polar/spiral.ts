/**
 * Produces an Archimedean spiral. It's a generator.
 *
 * ```js
 * const s = spiral(0.1, 1);
 * for (const coord of s) {
 *  // Use Polar coord...
 *  if (coord.step === 1000) break; // Stop after 1000 iterations
 * }
 * ```
 *
 * @param smoothness 0.1 pretty rounded, at around 5 it starts breaking down
 * @param zoom At smoothness 0.1, zoom starting at 1 is OK
 */

import type { Coord } from "./types.js";

export function* spiral(
  smoothness: number,
  zoom: number
): IterableIterator<Coord & { readonly step: number }> {
  let step = 0;

  while (true) {
    const a = smoothness * step++;
    yield {
      distance: zoom * a,
      angleRadian: a,
      step: step,
    };
  }
}

/**
 * Produces an Archimedian spiral with manual stepping.
 * @param step Step number. Typically 0, 1, 2 ...
 * @param smoothness 0.1 pretty rounded, at around 5 it starts breaking down
 * @param zoom At smoothness 0.1, zoom starting at 1 is OK
 * @returns
 */
export const spiralRaw = (
  step: number,
  smoothness: number,
  zoom: number
): Coord => {
  const a = smoothness * step;
  return Object.freeze({
    distance: zoom * a,
    angleRadian: a,
  });
};