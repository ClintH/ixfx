import type { RectPositioned } from "../rect/rect-types.js";
import type { Line } from "./line-type.js";
import { bbox as PointsBbox } from "../point/bbox.js";
/**
 * Returns a rectangle that encompasses dimension of line
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js';
 * const rect = Lines.bbox(line);
 * ```
 */
export const bbox = (line: Line): RectPositioned => PointsBbox(line.a, line.b);
