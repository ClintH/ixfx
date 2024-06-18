import type { RectPositioned } from "../rect/RectTypes.js";
import type { Line } from "./LineType.js";
import { bbox as PointsBbox } from "../point/Bbox.js";
/**
 * Returns a rectangle that encompasses dimension of line
 * 
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js';
 * const rect = Lines.bbox(line);
 * ```
 */
export const bbox = (line: Line): RectPositioned => PointsBbox(line.a, line.b);
