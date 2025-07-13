import { isPoint } from "../point/guard.js";
import type { Line, PolyLine } from "./line-type.js";

/**
 * Returns true if `p` is a valid line, containing `a` and `b` Points.
 * ```js
 * import { Lines } from 'https://unpkg.com/ixfx/dist/geometry.js'
 * Lines.isLine(l);
 * ```
 * @param p Value to check
 * @returns True if a valid line.
 */
export const isLine = (p: any): p is Line => {
  if (p === undefined) return false;
  if ((p as Line).a === undefined) return false;
  if ((p as Line).b === undefined) return false;
  if (!isPoint((p as Line).a)) return false;
  if (!isPoint((p as Line).b)) return false;
  return true;
};

/**
 * Returns true if `p` is a {@link PolyLine}, ie. an array of {@link Line}s.
 * Validates all items in array.
 * @param p 
 * @returns
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isPolyLine = (p: any): p is PolyLine => {
  if (!Array.isArray(p)) return false;

  const valid = !p.some(v => !isLine(v));
  return valid;
};

/**
 * Throws an exception if:
 * * line is undefined
 * * a or b parameters are missing
 * 
 * Does not validate points
 * @param line 
 * @param name 
 */
export const guard = (line: Line, name = `line`) => {
  if (line === undefined) throw new Error(`${ name } undefined`);
  if (line.a === undefined) throw new Error(`${ name }.a undefined. Expected {a:Point, b:Point}. Got: ${ JSON.stringify(line) }`);
  if (line.b === undefined) throw new Error(`${ name }.b undefined. Expected {a:Point, b:Point} Got: ${ JSON.stringify(line) }`);
};