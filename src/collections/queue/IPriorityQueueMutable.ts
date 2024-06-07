import type { IQueueMutable } from "./IQueueMutable.js";

/**
 * A prioritised item in queue
 */
export type PriorityItem<V> = Readonly<{
  /**
   * Item
   */
  item: V
  /**
   * Priority
   */
  priority: number
}>

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface IPriorityQueueMutable<V> extends IQueueMutable<PriorityItem<V>> {
  /**
   * Dequeues the item with highest priority.
   */
  dequeueMax(): V | undefined
  /**
   * Dequeues the item with the lowest priority.
   */
  dequeueMin(): V | undefined
  /**
   * Peeks at the item with highest priority without removing it.
   * _undefined_ if queue is empty.
   */
  peekMax(): V | undefined
  /**
   * Peeks at the item with the lowest priority without removing it.
   * _undefined_ if queue is empty.
   */
  peekMin(): V | undefined
}