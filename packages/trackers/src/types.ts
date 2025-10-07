export type Timestamped = {
  /**
   * Timestamp (Date.now)
   */
  readonly at: number
}
export type TimestampedObject<V> = V & Timestamped;

/**
 * Options
 */
export type TrackedValueOpts = {
  readonly id?: string;

  /**
   * If true, intermediate points are stored. False by default
   */
  readonly storeIntermediate?: boolean;
  /**
   * If above zero, tracker will reset after this many samples
   */
  readonly resetAfterSamples?: number;

  /**
   * If above zero, there will be a limit to intermediate values kept.
   *
   * When the seen values is twice `sampleLimit`, the stored values will be trimmed down
   * to `sampleLimit`. We only do this when the values are double the size so that
   * the collections do not need to be trimmed repeatedly whilst we are at the limit.
   *
   * Automatically implies storeIntermediate
   */
  readonly sampleLimit?: number;

  /**
   * If _true_, prints debug info
   */
  readonly debug?: boolean
};

export type TrimReason = `reset` | `resize`

export type TimestampedPrimitive<V extends number | string> = {
  at: number
  value: V
}
