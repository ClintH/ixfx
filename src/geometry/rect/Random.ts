import { type RandomSource, defaultRandom } from '../../random/Types.js';
import { sum as PointsSum } from '../point/index.js';
import type { Point } from '../point/PointType.js';
import { isPositioned } from './Guard.js';
import type { Rect, RectPositioned } from './RectTypes.js';
/**
 * Returns a random positioned Rect on a 0..1 scale.
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * const r = Rects.random(); // eg {x: 0.2549012, y:0.859301, width: 0.5212, height: 0.1423 }
 * ```
 *
 * A custom source of randomness can be provided:
 * ```js
 * import { Rects } from "https://unpkg.com/ixfx/dist/geometry.js";
 * import { weightedSource } from "https://unpkg.com/ixfx/dist/random.js"
 * const r = Rects.random(weightedSource(`quadIn`));
 * ```
 * @param rando
 * @returns
 */
export const random = (rando?: RandomSource): RectPositioned => {
  if (rando === undefined) rando = defaultRandom;

  return Object.freeze({
    x: rando(),
    y: rando(),
    width: rando(),
    height: rando(),
  });
};

export type RandomPointOpts = {
  readonly strategy?: `naive`;
  readonly randomSource?: RandomSource;
  readonly margin?: { readonly x: number; readonly y: number };
};

/**
 * Returns a random point within a rectangle.
 *
 * By default creates a uniform distribution.
 *
 * ```js
 * const pt = randomPoint({width: 5, height: 10});
 * ```'
 * @param within Rectangle to generate a point within
 * @param opts Options
 * @returns
 */
export const randomPoint = (
  within: Rect | RectPositioned,
  opts: RandomPointOpts = {}
): Point => {
  // TODO: Does not implement uniform distribution
  // See: https://math.stackexchange.com/questions/366474/find-coordinates-of-n-points-uniformly-distributed-in-a-rectangle
  const rand = opts.randomSource ?? defaultRandom;
  const margin = opts.margin ?? { x: 0, y: 0 };

  const x = rand() * (within.width - margin.x - margin.x);
  const y = rand() * (within.height - margin.y - margin.y);

  const pos = { x: x + margin.x, y: y + margin.y };
  return isPositioned(within) ? PointsSum(pos, within) : Object.freeze(pos);
};