import type { Point } from "../point/point-type.js";
import { fromPoints } from "./from-points.js";
import type { LinePath } from "./line-path-type.js";
import { toPath } from "./to-path.js";

/**
 * Returns a {@link LinePath} from two points
 * 
 * ```js
 * const path = Lines.fromPointsToPath(ptA, ptB);
 * ```
 * @param a 
 * @param b 
 * @returns 
 */
export const fromPointsToPath = (a: Point, b: Point): LinePath => toPath(fromPoints(a, b));
