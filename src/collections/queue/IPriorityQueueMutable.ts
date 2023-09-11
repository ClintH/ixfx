import type { IQueueMutable } from "./IQueueMutable.js";

export type PriorityItem<V> = Readonly<{
  item: V
  priority: number
}>

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface IPriorityQueueMutable<V> extends IQueueMutable<PriorityItem<V>> {
  dequeueMax(): V | undefined
  dequeueMin(): V | undefined
  peekMax(): V | undefined
  peekMin(): V | undefined
}