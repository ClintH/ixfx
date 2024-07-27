import type { Modulate } from "./Types.js";

/**
 * A 'no-op' function. Returns the input value without modification.
 * Useful for when some default is needed
 * @param v 
 * @returns 
 */
export const noop: Modulate = (v: number) => v;
