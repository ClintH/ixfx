import { numberTest, resultThrow } from "@ixfx/guards";
import type { Point } from "./point-type.js";
import { guard } from "./guard.js";
import { fromCartesian as PolarFromCartesian } from "../polar/index.js";
import { rotate as PolarRotate, toCartesian as PolarToCartesian } from "../polar/index.js";
/**
 * Rotate a single point by a given amount in radians
 * @param pt
 * @param amountRadian
 * @param origin
 */
export function rotate(pt: Point, amountRadian: number, origin?: Point): Point;

/**
 * Rotate several points by a given amount in radians
 * @param pt Points
 * @param amountRadian Amount to rotate in radians. If 0 is given, a copy of the input array is returned
 * @param origin Origin to rotate around. Defaults to 0,0
 */
export function rotate(
  pt: readonly Point[],
  amountRadian: number,
  origin?: Point
): readonly Point[];

export function rotate(
  pt: Point | readonly Point[],
  amountRadian: number,
  origin?: Point
): Point | readonly Point[] {
  if (typeof origin === `undefined`) origin = { x: 0, y: 0 };
  guard(origin, `origin`);
  resultThrow(numberTest(amountRadian, ``, `amountRadian`));
  const arrayInput = Array.isArray(pt);

  // no-op
  if (amountRadian === 0) return pt;

  if (!arrayInput) {
    pt = [ pt as Point ];
  }

  const ptAr = pt as readonly Point[];
  for (const [ index, p ] of ptAr.entries()) guard(p, `pt[${ index }]`);

  const asPolar = ptAr.map((p) => PolarFromCartesian(p, origin));
  const rotated = asPolar.map((p) => PolarRotate(p, amountRadian));
  const asCartesisan = rotated.map((p) => PolarToCartesian(p, origin));
  return arrayInput ? asCartesisan : asCartesisan[ 0 ];
}