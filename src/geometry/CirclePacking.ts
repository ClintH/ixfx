import { sortByNumericProperty } from "../collections/Arrays.js";
import * as Circles from "./Circle.js";
import * as Shapes from "./Shape.js";
import * as Points from './Point.js';
import type { RandomSource } from "../Random.js";

export type RandomOpts = {
  readonly attempts?: number
  readonly randomSource?: RandomSource
}
/**
 * Naive randomised circle packing.
 * [Algorithm by Taylor Hobbs](https://tylerxhobbs.com/essays/2016/a-randomized-approach-to-cicle-packing)
 */
export const random = (circles: ReadonlyArray<Circles.Circle>, container: Shapes.ShapePositioned, opts: RandomOpts = {}) => {
  if (!Array.isArray(circles)) throw new Error(`Parameter 'circles' is not an array`);
  const attempts = opts.attempts ?? 2000;

  const sorted = sortByNumericProperty(circles, `radius`);
  const positionedCircles: Array<Circles.CirclePositioned> = [];

  const willHit = (b: Points.Point, radius: number) => positionedCircles.some(v => Circles.isIntersecting(v, b, radius));

  while (sorted.length > 0) {
    //eslint-disable-next-line functional/immutable-data
    const circle = sorted.pop();
    if (!circle) break;

    const randomPointOpts = { ...opts, margin: { x: circle.radius, y: circle.radius } };

    //eslint-disable-next-line functional/no-let
    for (let index = 0; index < attempts; index++) {
      const position = Shapes.randomPoint(container, randomPointOpts);
      if (!willHit(position, circle.radius)) {
        //eslint-disable-next-line functional/immutable-data
        positionedCircles.push(Object.freeze({ ...circle, ...position }));
        break;
      }
    }
  }

  return positionedCircles;
};