import { sortByNumericProperty } from "@ixfx/arrays";
import type { RandomSource } from "@ixfx/random";
import { randomPoint as ShapesRandomPoint, type ShapePositioned } from "./shape/index.js";
import { isIntersecting as CirclesIsIntersecting } from "./circle/intersecting.js";
import type { Circle, CirclePositioned } from "./circle/circle-type.js";
import type { Point } from "./point/point-type.js";

export type RandomOpts = {
  readonly attempts?: number
  readonly randomSource?: RandomSource
}
/**
 * Naive randomised circle packing.
 * [Algorithm by Taylor Hobbs](https://tylerxhobbs.com/essays/2016/a-randomized-approach-to-cicle-packing)
 */
export const random = (circles: readonly Circle[], container: ShapePositioned, opts: RandomOpts = {}) => {
  if (!Array.isArray(circles)) throw new Error(`Parameter 'circles' is not an array`);
  const attempts = opts.attempts ?? 2000;

  const sorted = sortByNumericProperty(circles, `radius`);
  const positionedCircles: CirclePositioned[] = [];

  const willHit = (b: Point, radius: number) => positionedCircles.some(v => CirclesIsIntersecting(v, b, radius));

  while (sorted.length > 0) {
    //eslint-disable-next-line functional/immutable-data
    const circle = sorted.pop();
    if (!circle) break;

    const randomPointOpts = { ...opts, margin: { x: circle.radius, y: circle.radius } };

    //eslint-disable-next-line functional/no-let
    for (let index = 0; index < attempts; index++) {
      const position = ShapesRandomPoint(container, randomPointOpts);
      if (!willHit(position, circle.radius)) {
        //eslint-disable-next-line functional/immutable-data
        positionedCircles.push(Object.freeze({ ...circle, ...position }));
        break;
      }
    }
  }

  return positionedCircles;
};