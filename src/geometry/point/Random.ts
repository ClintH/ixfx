import { type RandomSource, defaultRandom } from '../../random/Types.js';
import type { Point } from './PointType.js';

/**
 * Returns a random point on a 0..1 scale.
 * ```js
 * import { Points } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const pt = Points.random(); // eg {x: 0.2549012, y:0.859301}
 * ```
 *
 * A custom source of randomness can be provided:
 * ```js
 * import { Points } from "https://unpkg.com/ixfx/dist/geometry.js";
 * import { weightedSource } from "https://unpkg.com/ixfx/dist/random.js"
 * const pt = Points.random(weightedSource(`quadIn`));
 * ```
 * @param rando
 * @returns
 */
export const random = (rando?: RandomSource): Point => {
  if (rando === undefined) rando = defaultRandom;

  return Object.freeze({
    x: rando(),
    y: rando(),
  });
};