import type { ReactiveOrSource } from "../types.js";
import { transform } from "./transform.js";

/**
 * Emits time in milliseconds since last message.
 * If it is the first value, 0 is used.
 * @param input 
 * @returns 
 */
export const elapsed = <In>(input: ReactiveOrSource<In>) => {
  let last = 0;
  return transform<In, number>(input, (_ignored) => {
    const elapsed = last === 0 ? 0 : Date.now() - last;
    last = Date.now();
    return elapsed;
  });
}