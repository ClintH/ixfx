import type { Line } from "./line-type.js";
import { resultThrow } from "@ixfx/guards";
import { lineTest } from "./guard.js";

/**
 * Reverses a line.
 * ````js
 * const a = { x: 10, y: 20 };
 * const b = { x: 100, y: 200 };
 * const line = reverse({ a, b });
 * // { a: { x: 100, y: 200 }, b: { x: 10, y: 20 } }
 * ```
 * @param line
 * @returns
 */
export function reverse(line: Line): Line {
  resultThrow(lineTest(line, `line`));
  return { a: line.b, b: line.a };
}