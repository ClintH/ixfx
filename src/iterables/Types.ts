import type { Interval } from "../flow/IntervalType.js";

export type ToArrayOptions = {
  /**
   * If set `toArray` continues until reaching this many results
   */
  limit: number
  /**
   * If set, `toArray` continues until this function returns false
   * @param count 
   * @returns 
   */
  while: (count: number) => boolean
  /**
   * If set, `toArray` continues until this much time elapses.
   */
  elapsed: Interval
}