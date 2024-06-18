import { compareByX } from "./Compare.js";
import { isEqual } from "./IsEqual.js";
import type { Point } from "./PointType.js";

/**
 * Simple convex hull impementation. Returns a set of points which
 * enclose `pts`.
 *
 * For more power, see something like [Hull.js](https://github.com/AndriiHeonia/hull)
 * @param pts
 * @returns
 */
export const convexHull = (...pts: ReadonlyArray<Point>): ReadonlyArray<Point> => {
  const sorted = [ ...pts ].sort(compareByX);
  if (sorted.length === 1) return sorted;

  const x = (points: Array<Point>) => {
    const v: Array<Point> = [];
    for (const p of points) {
      while (v.length >= 2) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const q = v.at(-1)!;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const r = v.at(-2)!;
        if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) {
          //eslint-disable-next-line functional/immutable-data
          v.pop();
        } else break;
      }
      //eslint-disable-next-line functional/immutable-data
      v.push(p);
    }
    //eslint-disable-next-line functional/immutable-data
    v.pop();
    return v;
  };

  const upper = x(sorted);
  //eslint-disable-next-line functional/immutable-data
  const lower = x(sorted.reverse());

  if (upper.length === 1 && lower.length === 1 && isEqual(lower[ 0 ], upper[ 0 ])) {
    return upper;
  }
  return [ ...upper, ...lower ];
};