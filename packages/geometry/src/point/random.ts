import { type RandomSource } from '@ixfx/random';
import type { Point, Point3d } from './point-type.js';

/**
 * Returns a random 2D point on a 0..1 scale.
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
  if (rando === undefined) rando = Math.random;

  return Object.freeze({
    x: rando(),
    y: rando(),
  });
};

/**
 * Returns a random 3D point on a 0..1 scale.
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
export const random3d = (rando?: RandomSource): Point3d => {
  if (rando === undefined) rando = Math.random;

  return Object.freeze({
    x: rando(),
    y: rando(),
    z: rando()
  });
};