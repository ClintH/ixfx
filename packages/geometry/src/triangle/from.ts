import { numberTest, resultThrow } from "@ixfx/guards";
import type { Triangle } from "./triangle-type.js";
import { fromNumbers as PointsFromNumbers } from "../point/from.js";
import { guard as PointGuard } from "../point/guard.js";
import type { Point } from "../point/point-type.js";
import { piPi } from "../pi.js";
import { toCartesian as PolarToCartesian } from "../polar/conversions.js";
/**
 * Returns an equilateral triangle centered at the origin.
 *
 * ```js
 * // Create a triangle at 100,100 with radius of 60
 * const tri = fromRadius({x:100,y:100}, 60);
 *
 * // Triangle with point A upwards, B to the right, C to the left
 * constr tri2 = fromRadius({x:100,y:100}, 60, {initialAngleRadian: -Math.PI / 2});
 * ```
 *
 *
 * @param origin Origin
 * @param radius Radius of triangle
 * @param opts Options
 */
export const fromRadius = (
  origin: Point,
  radius: number,
  opts: { readonly initialAngleRadian?: number } = {}
): Triangle => {
  resultThrow(numberTest(radius, `positive`, `radius`));
  PointGuard(origin, `origin`);

  const initialAngleRadian = opts.initialAngleRadian ?? 0;

  const angles = [
    initialAngleRadian,
    initialAngleRadian + (piPi * 1) / 3,
    initialAngleRadian + (piPi * 2) / 3,
  ];
  const points = angles.map((a) => PolarToCartesian(radius, a, origin));
  return fromPoints(points);
};


/**
 * Returns a triangle from a set of coordinates in a flat array form:
 * [xA, yA, xB, yB, xC, yC]
 * @param coords
 * @returns
 */
export const fromFlatArray = (coords: readonly number[]): Triangle => {
  if (!Array.isArray(coords)) throw new Error(`coords expected as array`);
  if (coords.length !== 6) {
    throw new Error(
      `coords array expected with 6 elements. Got ${ coords.length }`
    );
  }
  return fromPoints(PointsFromNumbers(...coords));
};


/**
 * Returns a triangle from an array of three points
 * @param points
 * @returns
 */
export const fromPoints = (points: readonly Point[]): Triangle => {
  if (!Array.isArray(points)) throw new Error(`points expected as array`);
  if (points.length !== 3) {
    throw new Error(
      `points array expected with 3 elements. Got ${ points.length }`
    );
  }
  const t: Triangle = {
    a: points[ 0 ],
    b: points[ 1 ],
    c: points[ 2 ],
  };
  return t;
};
