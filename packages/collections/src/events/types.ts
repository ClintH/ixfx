export type EventItem = Readonly<{
  /**
   * Start point, inclusive
   */
  start: number;
  /**
   * End point, exclusive
   */
  end: number;
}>;

export type EventItemAsDuration = Readonly<{
  start: number;
  duration: number;
}>;

export type IdEventItem = EventItem & Readonly<{ id: string }>;

export type SplitOptionsRelative = {
  percentage: number;
};

export type SplitOptionsAbsolute = {
  start: number;
};
export type SplitOptions = (SplitOptionsRelative | SplitOptionsAbsolute);

export type IndexedEventItem = Readonly<{ event: EventItem; index: number }>;

export type EventInterval = Readonly<{
  a: EventItem;
  b: EventItem;
  /**
   * Interval between start points (B - A)
   */
  startInterval: number;
  /**
   * Interval between end points (B - A)
   */
  endInterval: number;
  /**
   * Interval between end of `a` and start of `b` (B.start - A.end)
   * Note, this might be negative if a and b overlap
   */
  betweenInterval: number;
  indexA: number;
  indexB: number;
}>;

export type DefragmentOptions = Readonly<{
  gap: number;
  startAt: number;
}>;