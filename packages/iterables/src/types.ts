import type { Interval } from "@ixfx/core";

export type WithEvents = {
  addEventListener(type: string, callbackfn: any): void;
  removeEventListener(type: string, callbackfn: any): void;
}

export type IteratorControllerOptions<T> = Readonly<{
  delay?: Interval
  onValue: (value: T) => boolean | void
  iterator: () => IterableIterator<T>
}>

export type IteratorControllerState = `stopped` | `running` | `paused`


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

export type ForEachOptions = {
  /**
   * Interval after each iteration.
   * Only works with asynchronous forEach.
   */
  interval?: Interval
}