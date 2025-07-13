import type { ModulationFunction } from "./types.js";

/**
 * A 'no-op' function. Returns the input value without modification.
 * Useful for when some default is needed
 * @param v 
 * @returns 
 */
export const noop: ModulationFunction = (v: number) => v;
