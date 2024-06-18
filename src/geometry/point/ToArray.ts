import type { Point } from "./PointType.js";

/**
 * Returns point as an array in the form [x,y]. This can be useful for some libraries
 * that expect points in array form.
 *
 * ```
 * const p = {x: 10, y:5};
 * const p2 = toArray(p); // yields [10,5]
 * ```
 * @param p
 * @returns
 */
export const toArray = (p: Point): ReadonlyArray<number> => [ p.x, p.y ];
