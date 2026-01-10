import { Circle, CirclePositioned } from "../circle/circle-type.js";
import { Point } from "../point/point-type.js";
import { toPositioned as CircleToPositioned } from "../circle/to-positioned.js";
import { linearSpace } from "@ixfx/numbers";

export type CircleRingsOpts = {
  readonly rings?: number;
  /**
   * Rotation offset, in radians
   */
  readonly rotation?: number;
};
/**
 * Generates points spaced out on the given number of rings.
 *
 * Get points as array
 * ```js
 * const circle = { radius: 5, x: 100, y: 100 };
 * const opts = { rings: 5 };
 * const points = [...circleRings(circle, rings)];
 * ```
 *
 * Or iterate over them
 * ```js
 * for (const point of circleRings(circle, opts)) {
 * }
 * ```
 * Source: http://www.holoborodko.com/pavel/2015/07/23/generating-equidistant-points-on-unit-disk/#more-3453
 * @param circle
 */
export function* circleRings(
  circle?: Circle | CirclePositioned,
  opts: CircleRingsOpts = {}
): IterableIterator<Point> {
  const rings = opts.rings ?? 5;
  const c = CircleToPositioned(circle ?? { radius: 1, x: 0, y: 0 });
  const ringR = 1 / rings;
  const rotationOffset = opts.rotation ?? 0;
  const cos = Math.cos;
  const sin = Math.sin;
  const asin = Math.asin;
  const pi = Math.PI;
  const piPi = Math.PI * 2;
  let ringCount = 1;

  // Origin
  yield Object.freeze({ x: c.x, y: c.y });

  for (let r = ringR; r <= 1; r += ringR) {
    const n = Math.round(pi / asin(1 / (2 * ringCount)));
    for (const theta of linearSpace(0, piPi, n + 1)) {
      yield Object.freeze({
        x: c.x + r * cos(theta + rotationOffset) * c.radius,
        y: c.y + r * sin(theta + rotationOffset) * c.radius,
      });
    }
    ringCount++;
  }
}