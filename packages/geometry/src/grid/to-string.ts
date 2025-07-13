import type { GridCell } from "./types.js";

/**
 * Returns a key string for a cell instance
 * A key string allows comparison of instances by value rather than reference
 *
 * ```js
 * cellKeyString({x:10,y:20});
 * // Yields: "Cell{10,20}";
 * ```
 * @param v
 * @returns
 */
export const cellKeyString = (v: GridCell): string => `Cell{${ v.x },${ v.y }}`;
