import type { Point } from "../point/PointType.js";
import { fromPoints } from "./FromPoints.js";
import type { LinePath } from "./LinePathType.js";
import { toPath } from "./ToPath.js";

/**
 * Returns a {@link LinePath} from two points
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * const path = Lines.fromPointsToPath(ptA, ptB);
 * ```
 * @param a 
 * @param b 
 * @returns 
 */
export const fromPointsToPath = (a: Point, b: Point): LinePath => toPath(fromPoints(a, b));
