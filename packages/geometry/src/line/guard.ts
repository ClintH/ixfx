import type { Result } from "@ixfx/guards";
import type { Line, PolyLine } from "./line-type.js";
import { isPoint } from "../point/guard.js";

/**
 * Returns true if `p` is a valid line, containing `a` and `b` Points.
 * ```js
 * Lines.isLine(l);
 * ```
 * @param p Value to check
 * @returns True if a valid line.
 */
export function isLine(p: any): p is Line {
  if (p === undefined)
    return false;
  if ((p as Line).a === undefined)
    return false;
  if ((p as Line).b === undefined)
    return false;
  if (!isPoint((p as Line).a))
    return false;
  if (!isPoint((p as Line).b))
    return false;
  return true;
}

/**
 * Returns true if `p` is a {@link PolyLine}, ie. an array of {@link Line}s.
 * Validates all items in array.
 * @param p
 * @returns
 */

export function isPolyLine(p: any): p is PolyLine {
  if (!Array.isArray(p))
    return false;

  const valid = !p.some(v => !isLine(v));
  return valid;
}

/**
 * Returns a failure if:
 * - line is undefined
 * - a or b parameters are missing
 *
 * Does not validate points
 * @param line
 * @param name
 */
export function lineTest(line: Line, name = `line`): Result<boolean, string> {
  if (line === undefined)
    return { success: false, error: `${name} undefined` };
  if (line.a === undefined)
    return { success: false, error: `${name}.a undefined. Expected {a:Point, b:Point}. Got: ${JSON.stringify(line)}` };
  if (line.b === undefined)
    return { success: false, error: `${name}.b undefined. Expected {a:Point, b:Point} Got: ${JSON.stringify(line)}` };
  return { success: true, value: true };
}
